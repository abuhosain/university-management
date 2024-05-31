import { TAcademicSemester } from '../academicSemester/academicSemester.interface'
import { User } from './user.model'

const findLastStudentId = async () => {
  const lastStudent = await User.findOne(
    {
      role: 'student',
    },
    {
      id: 1,
      _id: 0,
    },
  )
    .sort({ createdAt: -1 })
    .lean()

  return lastStudent?.id ? lastStudent.id : undefined
}

export const generatedStudentId = async (payload: TAcademicSemester) => {
  // first time

  let currentId = (0).toString() // by defaule
  const lastStudentId = await findLastStudentId()
  const lastStudentSemesterCode = lastStudentId?.substring(4, 6)
  const lastStudentYear = lastStudentId?.substring(0, 4)
  const currentSemesterCode = payload.code
  const currentYear = payload.year

  if (
    lastStudentId &&
    lastStudentSemesterCode === currentSemesterCode &&
    lastStudentYear === currentYear
  ) {
    currentId = lastStudentId.substring(6) // 00001
  }

  let increamentId = (Number(currentId) + 1).toString().padStart(4, '0')
  increamentId = `${payload.year}${payload.code}${increamentId}`
  return increamentId
}
