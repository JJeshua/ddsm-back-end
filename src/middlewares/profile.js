import pkg from 'lodash';

import { getUserById, getUserByUsername } from '../db/users.js';

const { get, merge } = pkg;

/**
 * Middleware to check if a profile exists.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const profileExists = async (req, res, next) => {
  try {
    // Extract user ID from request parameters
    const { id: user_id } = req.params;

    // Retrieve the profile by user ID
    const profile = await getUserById(user_id, false);

    // Check if the profile exists
    if (!profile) {
      // If the profile does not exist, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'Profile does not exist' });
    }

    // Merge profile identity into request object
    merge(req, { identity: profile });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during profile existence check, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Middleware to check if a user exists by username.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const userExistsByUsername = async (req, res, next) => {
  try {
    // Extract username from request parameters
    const { username } = req.params;

    // Retrieve the user by username
    const requested_user = await getUserByUsername(username);

    // Check if the user exists
    if (!requested_user) {
      // If the user does not exist, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'User does not exist' });
    }

    // Merge user identity into request object
    merge(req, { requested_user_identity: requested_user });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during user existence check, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Middleware to retrieve the full profile of the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const getFullProfile = async (req, res, next) => {
  try {
    // Extract authenticated user from request
    const user = get(req, 'identity');

    // Retrieve the full profile of the authenticated user
    const profile = await getUserById(user._id, false);

    // Merge profile identity into request object
    merge(req, { identity: profile });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during profile retrieval, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Middleware to check and prepare the payload for updating a user profile.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const checkUpdateProfilePayload = (req, res, next) => {
  // Destructure request body
  const {
    username,
    country,
    first_name,
    last_name,
    profile_picture,
    biography,
  } = req.body;

  try {
    // Check if any data is supplied for profile update
    if (
      !username &&
      !country &&
      !first_name &&
      !last_name &&
      !profile_picture &&
      !biography
    ) {
      // If no data is supplied, send a 400 Bad Request response with an error message
      return res.status(400).json({ error: 'No data supplied' });
    }

    // Initialize an empty object to store the new profile data
    let newProfileData = {};

    // Check each field and include it in the new profile data if it is defined
    if (username !== undefined) newProfileData.username = username;
    if (country !== undefined) newProfileData.country = country;
    if (first_name !== undefined) newProfileData.first_name = first_name;
    if (last_name !== undefined) newProfileData.last_name = last_name;
    if (profile_picture !== undefined)
      newProfileData.profile_picture = profile_picture;
    if (biography !== undefined) newProfileData.biography = biography;

    // Merge new profile data into the request object
    merge(req, { newProfileData });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during payload preparation, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.sendStatus(500);
  }
};

/**
 * Middleware to check if the authenticated user is the owner of the profile.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const isProfileOwner = (req, res, next) => {
  try {
    // Extract authenticated user from request
    const user = get(req, 'identity');

    // Check if the user exists
    if (!user) {
      // If the user does not exist, send a 500 Internal Server Error response
      return res.sendStatus(500);
    }

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during ownership check, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.sendStatus(500);
  }
};
