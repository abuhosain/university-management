import httpStatus from 'http-status'
import AppError from '../../errors/AppError'
import { User } from '../user/user.model'
import { TLoginUser } from './auth.interface'
import { JwtPayload } from 'jsonwebtoken'
import config from '../../config'
import bcrypt from 'bcrypt'
import { createToken } from './auth.utils'
import jwt from "jsonwebtoken"

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByCustomId(payload?.id)
  // console.log(user)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This  user is not found')
  }

  //   // checking if the user is already deleted
  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This  user is deleted')
  }

  //   // checkin isUser was blocked
  const isBlocked = user?.status
  if (isBlocked === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This  user is blocked')
  }

  // cheking if the password is correct
  if (!(await User.isUserPasswordMatch(payload?.password, user?.password))) {
    throw new AppError(httpStatus.NOT_FOUND, 'This  user password is not mathc')
  }

  // access Granted token and refresh token;
  //   create token and sent to the client

  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expire_in as string,
  )

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refrsh_expire_in as string,
  )

  return {
    accessToken,
    needsPassowordChange: user?.needsPassowordChange,
    refreshToken,
  }
}

const changePassword = async (
  userData: JwtPayload,
  payload: {
    oldPassword: string
    newPassword: string
  },
) => {
  const user = await User.isUserExistsByCustomId(userData?.userId)
  // console.log(user)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This is user is not found')
  }

  //   // checking if the user is already deleted
  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This is user is deleted')
  }

  //   // checkin isUser was blocked
  const isBlocked = user?.status
  if (isBlocked === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This is user is blocked')
  }

  // cheking if the password is correct
  if (!(await User.isUserPasswordMatch(payload?.oldPassword, user?.password))) {
    throw new AppError(httpStatus.NOT_FOUND, 'This  user password is not mathc')
  }

  // new hashedPassword
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  )

  await User.findOneAndUpdate(
    { id: userData.userId, role: userData.role },
    {
      password: newHashedPassword,
      needsPassowordChange: false,
      passwordChangesAt: new Date(),
    },
  )

  return null
}

const refreshToken = async(token: string) => {
 
  // checkin if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload
  const { userId, iat } = decoded

  const user = await User.isUserExistsByCustomId(userId)
  console.log(user)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This is user is not found')
  }

  //   // checking if the user is already deleted
  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This is user is deleted')
  }

  //   // checkin isUser was blocked
  const isBlocked = user?.status
  if (isBlocked === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This is user is blocked')
  }

  if (
    user.passwordChangesAt &&
    User.isJwtIssuedBeforePasswordChanged(user.passwordChangesAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized')
  }

  const jwtPayload = {
    userId: user?.id,
    role: user?.role,
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expire_in as string,
  )

  return {
    accessToken
  }

}

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
}
