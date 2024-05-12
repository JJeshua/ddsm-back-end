import { createUser } from '../db/users.js';
import { generateRandomString, authentication } from '../helpers/index.js';
import { getUserByEmail } from '../db/users.js';

import pkg from 'lodash';
const { get, merge } = pkg;

/**
 * Registers a new user.
 *
 * @param {Object} req - The request object containing user registration data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const register = async (req, res) => {
  // Check if the registration request body is valid
  const registrationRequestBodyValid = get(
    req,
    'registrationRequestBodyValid',
    false
  );

  if (!registrationRequestBodyValid) {
    // If request body is invalid, send a 400 Bad Request response
    return res.status(400).json({
      error: 'Invalid request...',
    });
  }

  try {
    // Extract user registration data from the request body
    const { first_name, last_name, username, email, password, date_of_birth } =
      req.body;

    // Check if a user with the provided email already exists
    const userExists = await getUserByEmail(email);

    if (userExists) {
      // If user already exists, send a 400 Bad Request response
      return res.status(400).json({
        error: 'User already exists...',
      });
    }

    // Generate a random salt for password hashing
    const salt = generateRandomString();

    // Create a new user with the provided data
    const user = await createUser({
      username,
      email,
      authentication: {
        password: authentication(salt, password), // Hash the password with the generated salt
        salt,
      },
      user_info: {
        first_name,
        last_name,
        date_of_birth,
      },
    });

    // If user creation is successful, send a 200 OK response
    return res.sendStatus(200);
  } catch (error) {
    // If an error occurs during user registration, log the error and send a 500 Internal Server Error response
    console.error('Error registering user: ', error);
    return res.sendStatus(500);
  }
};

/**
 * Authenticates a user and creates a session token upon successful login.
 *
 * @param {Object} req - The request object containing user login data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const login = async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // Check if email or password is missing
  if (!email || !password) {
    // If email or password is missing, send a 400 Bad Request response
    return res.status(400).json({
      error: 'Invalid email or password...',
    });
  }

  // Retrieve user by email from the database
  const user = await getUserByEmail(email, true);

  // Check if user exists
  if (!user) {
    // If user doesn't exist, send a 400 Bad Request response
    return res.status(400).json({
      error: 'Invalid email or password...',
    });
  }

  // Extract hashed password and salt from the user object
  const { password: hashedPassword, salt } = user.authentication;

  // Compare the provided password with the hashed password
  if (authentication(salt, password) !== hashedPassword) {
    // If passwords don't match, send a 400 Bad Request response
    return res.status(400).json({
      error: 'Invalid email or password...',
    });
  }

  // Generate a session token and update user's session_token field
  user.authentication.session_token = authentication(
    generateRandomString(),
    user._id.toString()
  );

  // Save the updated user object
  await user.save();

  // Set a cookie with the session token
  res.cookie('session_token', user.authentication.session_token, {
    domain: 'localhost',
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'none',
  });

  // Send a 200 OK response indicating successful login
  return res.sendStatus(200);
};

/**
 * Logs out the currently authenticated user by invalidating the session token.
 *
 * @param {Object} req - The request object containing user identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const logout = async (req, res) => {
  // Extract user identity from the request
  const user = get(req, 'identity');

  // Generate a new session token and update the user's session_token field
  user.authentication.session_token = authentication(
    generateRandomString(),
    user._id.toString()
  );

  // Save the updated user object
  await user.save();

  // Send a 200 OK response indicating successful logout
  return res.sendStatus(200);
};
