import { z } from 'zod'

// UserName Schema
const creteUserNameValidationSchema = z.object({
  firstname: z
    .string()
    .max(20, 'First name cannot exceed 20 characters')
    .refine((value) => value.charAt(0) === value.charAt(0).toUpperCase(), {
      message: 'First name must be capitalized',
    }),
  middleName: z.string().optional(),
  lastName: z.string().refine((value) => /^[a-zA-Z]+$/.test(value), {
    message: 'Last name must contain only alphabetic characters',
  }),
})

// Guardian Schema
const createGuardianValidationSchema = z.object({
  fatherName: z.string(),
  fatherOccuption: z.string(),
  fatherContact: z.string(),
  motherName: z.string(),
  motherOccuption: z.string(),
  motherContact: z.string(),
})

// LocalGuardian Schema
const createLocalGuardianValidationSchema = z.object({
  name: z.string(),
  occuption: z.string(),
  contactNo: z.string(),
  address: z.string(),
})

// Student Schema
const createStudentValidationSchema = z.object({
  body: z.object({
    password: z.string().max(20).optional(),
    student: z.object({
      name: creteUserNameValidationSchema,
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().optional(),
      email: z.string().email(),
      contactNumber: z.string(),
      emergencyContatNo: z.string(),
      bloodGroup: z
        .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .optional(),
      presentAddress: z.string(),
      permamentAddress: z.string(),
      gurdian: createGuardianValidationSchema,
      localGuardian: createLocalGuardianValidationSchema,
      profileImg: z.string().optional(),
      admissiionSemester: z.string(),
      academicDepartment: z.string(),
    }),
  }),
})

const updateStudentValidationSchema = createStudentValidationSchema.deepPartial();

// Export the schemas
export const studentValidations = {
  createStudentValidationSchema,
  updateStudentValidationSchema
}
