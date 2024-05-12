import express from 'express';
import pkg from 'lodash';
import { getUserBySessionToken } from '../db/users.js';
const { get, merge } = pkg;

/**
 * Middleware to validate registration request body.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const isValidRegistrationRequestBody = (req, res, next) => {
  // Destructure request body to extract required fields
  const { first_name, last_name, username, email, password, date_of_birth } =
    req.body;

  // Validation checks for required fields
  if (!first_name) {
    return res.status(400).json({ error: 'First name is required...' });
  }
  if (!last_name) {
    return res.status(400).json({ error: 'Last name is required...' });
  }
  if (!username) {
    return res.status(400).json({ error: 'Username is required...' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required...' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required...' });
  }
  if (!date_of_birth) {
    return res.status(400).json({ error: 'Date of birth is required...' });
  }

  // Additional validation checks for field lengths
  if (first_name.length < 3) {
    return res
      .status(400)
      .json({ error: 'First name must be at least 3 characters...' });
  }
  if (last_name.length < 3) {
    return res
      .status(400)
      .json({ error: 'Last name must be at least 3 characters...' });
  }
  if (username.length < 3) {
    return res
      .status(400)
      .json({ error: 'Username must be at least 3 characters...' });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Password must be at least 6 characters...' });
  }

  // Validate date_of_birth format
  if (!(date_of_birth instanceof Date) || isNaN(body.date_of_birth)) {
    let date = new Date(date_of_birth);
    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json({ error: 'Invalid date format for date_of_birth' });
    }
  }

  // If all validation passes, set registrationRequestBodyValid flag to true in request object
  const registrationRequestBodyValid = true;
  merge(req, { registrationRequestBodyValid });

  // Proceed to the next middleware in the chain
  next();
};

/**
 * Middleware to check if the user is authenticated.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const isAuthenticated = async (req, res, next) => {
  // Extract session token from request cookies
  const session_token = req.cookies.session_token;

  // Check if session token exists
  if (!session_token) {
    // If session token does not exist, send a 403 Forbidden response with an error message
    return res.status(403).json({ error: 'No session token' });
  }

  // Retrieve user using session token
  const user = await getUserBySessionToken(session_token);

  // Check if user exists
  if (!user) {
    // If user does not exist, send a 403 Forbidden response with an error message
    return res.status(403).json({ error: 'Invalid session token' });
  }

  // Merge user identity into request object
  merge(req, { identity: user });

  // Proceed to the next middleware in the chain
  next();
};

/**
 * Endpoint handler for a successful request.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void} - Returns void.
 */
export const success = (req, res) => {
  // Send a 200 OK response
  return res.sendStatus(200);
};
