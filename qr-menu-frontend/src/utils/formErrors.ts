import axios from 'axios';

export interface UserFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

interface ValidationIssue {
  path?: Array<string | number>;
  message?: string;
}

export const getUserFormErrors = (error: unknown): UserFormErrors => {
  if (!axios.isAxiosError(error)) {
    return { form: error instanceof Error ? error.message : 'Unable to create user. Please try again.' };
  }

  const response = error.response?.data as {
    message?: string;
    errors?: ValidationIssue[] | Record<string, string>;
  } | undefined;
  const result: UserFormErrors = {};
  const message = response?.message ?? '';

  if (Array.isArray(response?.errors)) {
    for (const issue of response.errors) {
      const field = issue.path?.[0];
      if (field === 'full_name') result.fullName = issue.message;
      if (field === 'email') result.email = issue.message;
      if (field === 'phone') result.phone = issue.message;
      if (field === 'password') result.password = issue.message;
      if (typeof field === 'string' && issue.message) result.form ??= issue.message;
    }
  } else if (response?.errors && typeof response.errors === 'object') {
    const errors = response.errors as Record<string, string>;
    result.fullName = errors.full_name ?? errors.fullName;
    result.email = errors.email;
    result.phone = errors.phone;
    result.password = errors.password;
  }

  if (/email.*already registered|email.*already exists/i.test(message)) result.email = 'Email address already exists.';
  else if (/phone.*already registered|phone.*already exists/i.test(message)) result.phone = 'Phone number already exists.';
  else if (/invalid email/i.test(message)) result.email = 'Please enter a valid email address.';
  else if (!result.form && message) result.form = message;

  return result;
};
