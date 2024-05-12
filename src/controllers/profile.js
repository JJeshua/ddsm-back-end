import {
  updateUserProfile,
  archiveProfile as _archiveProfile,
  deleteProfile as _deleteProfile,
  unarchiveProfile as _unarchiveProfile,
} from '../db/users.js';
import pkg from 'lodash';
const { get, merge } = pkg;

/**
 * Retrieves the profile of the authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and the retrieved profile.
 */
export const getProfile = async (req, res) => {
  // Extract profile information of the authenticated user from the request
  const profile = get(req, 'identity');

  try {
    // Send a 200 OK response with the retrieved profile
    return res.status(200).json({ profile });
  } catch (error) {
    // If an error occurs during retrieval, log the error and send a 500 Internal Server Error response
    console.error('Error retrieving profile: ', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Updates the profile of the authenticated user.
 *
 * @param {Object} req - The request object containing user identity and new profile data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const updateProfile = async (req, res) => {
  // Extract authenticated user from the request
  const user = get(req, 'identity');

  // Extract new profile data from the request
  const newProfileData = get(req, 'newProfileData');

  // If profile picture is provided in base64 format, convert it to a Buffer object
  if (newProfileData.profile_picture) {
    newProfileData.profile_picture = Buffer.from(
      newProfileData.profile_picture,
      'base64'
    );
  }

  try {
    // Update the user's profile with the new data
    await updateUserProfile(user._id, newProfileData);

    // Send a 200 OK response indicating successful profile update
    return res.sendStatus(200);
  } catch (error) {
    // If an error occurs during profile update, log the error and send a 500 Internal Server Error response
    console.error('Error updating profile: ', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

/**
 * Archives the profile of the authenticated user.
 *
 * @param {Object} req - The request object containing user identity.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const archiveProfile = async (req, res) => {
  try {
    // Extract authenticated user from the request
    const user = get(req, 'identity');

    // Archive the profile of the user
    await _archiveProfile(user._id);

    // Send a 200 OK response indicating successful profile archiving
    res.sendStatus(200);
  } catch (error) {
    // If an error occurs during profile archiving, log the error and send a 500 Internal Server Error response
    console.error('Error archiving profile: ', error);
    return res.sendStatus(500);
  }
};

/**
 * Deletes the profile of the authenticated user.
 *
 * @param {Object} req - The request object containing user identity.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const deleteProfile = async (req, res) => {
  try {
    // Extract authenticated user from the request
    const user = get(req, 'identity');

    // Delete the profile of the user
    const { status, message } = await _deleteProfile(user._id);

    // Determine the appropriate response based on the status and message returned
    if (status === 400) {
      // If there is a status of 400, send a 400 Bad Request response with the message
      res.status(status).json({ message });
    } else {
      // Otherwise, send the status as is
      res.sendStatus(status);
    }
  } catch (error) {
    // If an error occurs during profile deletion, log the error and send a 500 Internal Server Error response
    console.error('Error deleting profile:', error);
    return res.sendStatus(500);
  }
};

/**
 * Unarchives the profile of the authenticated user.
 *
 * @param {Object} req - The request object containing user identity.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const unarchiveProfile = async (req, res) => {
  try {
    // Extract authenticated user from the request
    const user = get(req, 'identity');

    // Unarchive the profile of the user
    await _unarchiveProfile(user._id);

    // Send a 200 OK response indicating successful profile unarchiving
    res.sendStatus(200);
  } catch (error) {
    // If an error occurs during profile unarchiving, log the error and send a 500 Internal Server Error response
    console.error('Error trying to unarchive profile: ', error);
    return res.sendStatus(500);
  }
};
