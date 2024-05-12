import mongoose from 'mongoose';

import { deleteAllPosts } from './posts.js';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false },
    session_token: { type: String, select: false },
  },
  user_info: {
    country: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    date_of_birth: { type: Date },
    profile_picture: { type: Buffer }, // Assuming profile_picture is stored as binary data, after being converted from base64 ASCII string
    datetime_created: { type: Date, default: Date.now },
    biography: { type: String },
  },
  profile_is_archived: {
    type: Boolean,
    default: false,
  },
});

export const UserModel = mongoose.model('User', userSchema);

/**
 * Creates a new user.
 *
 * @param {object} values - The values to create the new user.
 * @returns {Promise<object>} - A promise that resolves to the created user object.
 */
export const createUser = async (values) => {
  return UserModel(values)
    .save()
    .then((user) => user.toObject());
};

/**
 * Retrieves a user by their ID.
 *
 * @param {string} id - The ID of the user to retrieve.
 * @param {boolean} [includeCredentials=false] - Whether to include authentication credentials in the retrieved user object.
 * @returns {Promise<object|null>} - A promise that resolves to the user object if found, or null if not found.
 */
export const getUserById = async (id, includeCredentials = false) => {
  if (includeCredentials) {
    return UserModel.findById(id).select(
      'authentication.password authentication.salt'
    );
  }

  return UserModel.findById(id);
};

/**
 * Retrieves a user by their email address.
 *
 * @param {string} email - The email address of the user to retrieve.
 * @param {boolean} [includeCredentials=false] - Whether to include authentication credentials in the retrieved user object.
 * @returns {Promise<object|null>} - A promise that resolves to the user object if found, or null if not found.
 */
export const getUserByEmail = async (email, includeCredentials = false) => {
  if (includeCredentials) {
    return UserModel.findOne({ email }).select(
      'authentication.password authentication.salt'
    );
  }

  return UserModel.findOne({ email });
};

/**
 * Retrieves a user by their username.
 *
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<object|null>} - A promise that resolves to the user object if found, or null if not found.
 */
export const getUserByUsername = async (username) => {
  return UserModel.findOne({ username });
};

/**
 * Updates a user's session token.
 *
 * @param {string} id - The ID of the user to update.
 * @param {string} session_token - The new session token for the user.
 * @returns {Promise<object|null>} - A promise that resolves to the updated user object if found, or null if not found.
 */
export const updateUserSessionToken = async (id, session_token) => {
  return UserModel.findByIdAndUpdate(id, {
    'authentication.session_token': session_token,
  });
};

/**
 * Retrieves a user by their session token.
 *
 * @param {string} session_token - The session token of the user to retrieve.
 * @returns {Promise<object|null>} - A promise that resolves to the user object if found, or null if not found.
 */
export const getUserBySessionToken = async (session_token) => {
  return UserModel.findOne({
    'authentication.session_token': session_token,
  }).select('authentication.salt');
};

/**
 * Updates a user's profile information.
 *
 * @param {string} id - The ID of the user to update.
 * @param {object} updates - The updates to apply to the user's profile.
 * @param {string} [updates.username] - The new username for the user.
 * @param {string} [updates.email] - The new email address for the user.
 * @param {string} [updates.country] - The new country for the user.
 * @param {string} [updates.first_name] - The new first name for the user.
 * @param {string} [updates.last_name] - The new last name for the user.
 * @param {Date|string} [updates.date_of_birth] - The new date of birth for the user. Can be a Date object or a string in 'YYYY-MM-DD' format.
 * @param {string} [updates.profile_picture] - The new profile picture for the user, provided as a base64 encoded string.
 * @param {string} [updates.biography] - The new biography for the user.
 * @returns {Promise<object>} - A promise that resolves to the updated user object.
 * @throws {Error} - If the user is not found.
 */
export const updateUserProfile = async (id, updates) => {
  const user = await getUserById(id, false);

  if (!user) throw new Error('User not found');

  if (updates.username) {
    user.username = updates.username;
  }
  if (updates.email) {
    user.email = updates.email;
  }

  if (updates.country) {
    user.user_info.country = updates.country;
  }
  if (updates.first_name) {
    user.user_info.first_name = updates.first_name;
  }
  if (updates.last_name) {
    user.user_info.last_name = updates.last_name;
  }
  if (updates.date_of_birth) {
    user.user_info.date_of_birth = updates.date_of_birth;
  }
  if (updates.profile_picture) {
    user.user_info.profile_picture = updates.profile_picture;
  }
  if (updates.biography) {
    user.user_info.biography = updates.biography;
  }

  return await user.save();
};

/**
 * Archives a user's profile.
 *
 * @param {string} id - The ID of the user whose profile to archive.
 * @returns {Promise<object>} - A promise that resolves to the updated user object with the profile archived.
 */
export const archiveProfile = async (id) => {
  const user = await getUserById(id, false);
  user.profile_is_archived = true;
  return user.save();
};

/**
 * Deletes a user's profile.
 *
 * @param {string} id - The ID of the user whose profile to delete.
 * @returns {Promise<object>} - A promise that resolves to an object containing the status of the deletion operation.
 * If the profile is successfully deleted, the status will be 200. If the profile is not archived, the status will be 400,
 * and a message will be provided indicating that a profile cannot be deleted if it is not archived. If an error occurs during
 * deletion, the status will be 500, and a message will indicate the error.
 */
export const deleteProfile = async (id) => {
  const user = await UserModel.findById(id);
  if (!user.profile_is_archived) {
    return {
      status: 400,
      message: 'Cannot delete a profile that is not archived',
    };
  }
  try {
    await deleteAllPosts(id);
    await UserModel.deleteOne({ _id: id });
    return { status: 200 };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return {
      status: 500,
      message: 'Error deleting profile',
    };
  }
};

/**
 * Unarchives a user's profile.
 *
 * @param {string} id - The ID of the user whose profile to unarchive.
 * @returns {Promise<object>} - A promise that resolves to the updated user object with the profile unarchived.
 */
export const unarchiveProfile = async (id) => {
  const user = await getUserById(id, false);
  user.profile_is_archived = false;
  return user.save();
};

/**
 * Retrieves user data associated with reactions (likes or comments) on posts.
 *
 * @param {object} reactions - An object containing the type of reactions ('likes' or 'comments') and their content.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of objects containing user data associated with the reactions.
 * Each object includes the username, profile picture, first name, and last name of the user.
 * If the type is 'comments', each object also includes the comment content and timestamp.
 */
export const getReactionAndUserData = async (reactions) => {
  const users = new Array();
  if (reactions.type == 'comments') {
    reactions.content.forEach((comment) => {
      users.push(comment.comment_owner_id);
    });
  } else {
    reactions.content.forEach((like) => {
      users.push(like.like_owner_id);
    });
  }
  const reactionAndUserData = Array();
  for (const user of users) {
    const info = await UserModel.findById(user.toString());
    reactionAndUserData.push({
      username: info.username,
      profile_pic: info.user_info.profile_picture,
      first_name: info.user_info.first_name,
      last_name: info.user_info.last_name,
    });
  }
  //also fetch every comment's content and timestamp:
  if (reactions.type == 'comments') {
    for (let i = 0; i < reactionAndUserData.length; i++) {
      reactionAndUserData[i] = {
        ...reactionAndUserData[i],
        content: reactions.content[i].comment_content,
        timestamp: reactions.content[i].comment_timestamp,
      };
    }
  }
  return reactionAndUserData;
};
