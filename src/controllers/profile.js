import {
  updateUserProfile,
  archiveProfile as _archiveProfile,
  deleteProfile as _deleteProfile,
  unarchiveProfile as _unarchiveProfile,
  getUserInfo,
  getUserList,
} from '../db/users.js';
import pkg from 'lodash';
const { get, merge } = pkg;

export const getProfile = async (req, res) => {
  const profile = get(req, 'identity');

  try {
    return res.status(200).json({ profile });
  } catch (error) {
    console.error('Error updating profile: ', error);
    return res.status(500).json({
      error: 'Invalid request...',
    });
  }
};

export const updateProfile = async (req, res) => {
  const user = get(req, 'identity');
  const newProfileData = get(req, 'newProfileData');

  if (newProfileData.profile_picture) {
    //converting base64 string from the request body into a Buffer object (binary)
    newProfileData.profile_picture = Buffer.from(
      newProfileData.profile_picture,
      'base64'
    );
  }

  try {
    await updateUserProfile(user._id, newProfileData);

    return res.sendStatus(200);
  } catch (error) {
    console.error('Error updating profile: ', error);
    return res.status(500).json({
      error: 'Invalid request...',
    });
  }
};

export const archiveProfile = async (req, res) => {
  try {
    const user = get(req, 'identity');
    await _archiveProfile(user._id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error archiving profile: ', error);
    return res.sendStatus(500);
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const user = get(req, 'identity');
    const { status, message } = await _deleteProfile(user._id);
    if (status === 400) {
      res.status(status).json({ message });
    } else {
      res.sendStatus(status);
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    return res.sendStatus(500);
  }
};

export const unarchiveProfile = async (req, res) => {
  try {
    const user = get(req, 'identity');
    await _unarchiveProfile(user._id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error trying to unarchive profile: ', error);
    return res.sendStatus(500);
  }
};

export const getUserPublicInfo = async (req, res) => {
  try {
    const username = req.params.username;
    const info = await getUserInfo(username);
    let infoClone = {};
    if(info.profile_picture) {
      infoClone = {...info, 'profile_picture': info.profile_picture.toString('base64')};
    } else {
      infoClone = {...info};
    };
    return res.status(200).json(infoClone);
  } catch (error){
    console.error('Error fetching profile picture: ', error);
    return res.sendStatus(500);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getUserList();
    const formattedUsers = users.map((user) => ({
      username: user.username,
      profilePic: user.user_info.profile_picture ? user.user_info.profile_picture.toString('base64') : user.user_info.profile_picture,
    }));
    return res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).send('Server Error');
  }
};