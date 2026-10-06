import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '@centaur/lms-shared';
import { ApiRequestError, login, register } from './lib/auth-api.js';
import { AuthCard, FormAlert, FormField } from './auth-ui.js';
import { Button } from './components/ui/button.js';

function errorMessage(error: unknown) {
  return error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const mutation = useMutation({ mutationFn: login, onSuccess: async ({ user }) => {
    queryClient.setQueryData(['me'], user);
    await navigate('/dashboard', { replace: true });
  } });
  return <AuthCard title="Welcome back" description="Sign in to continue your learning.">
    <form className="space-y-4" onSubmit={form.handleSubmit((value) => mutation.mutate(value))}>
      <FormField label="Email" name="email" type="email" autoComplete="email" registration={form.register('email')} error={form.formState.errors.email?.message} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" registration={form.register('password')} error={form.formState.errors.password?.message} />
      {mutation.isError && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}
      <Button className="w-full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Signing in…' : 'Sign in'}</Button>
      <p className="text-center text-sm text-slate-600">New here? <Link className="font-semibold text-sky-800 hover:underline" to="/register">Create an account</Link></p>
    </form>
  </AuthCard>;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { displayName: '' } });
  const mutation = useMutation({ mutationFn: register, onSuccess: async ({ user }) => {
    queryClient.setQueryData(['me'], user);
    await navigate('/dashboard', { replace: true });
  } });
  return <AuthCard title="Create your account" description="Start learning for free.">
    <form className="space-y-4" onSubmit={form.handleSubmit((value) => mutation.mutate(value))}>
      <FormField label="Name (optional)" name="displayName" autoComplete="name" registration={form.register('displayName')} required={false} error={form.formState.errors.displayName?.message} />
      <FormField label="Email" name="email" type="email" autoComplete="email" registration={form.register('email')} error={form.formState.errors.email?.message} />
      <FormField label="Password (at least 8 characters)" name="password" type="password" autoComplete="new-password" registration={form.register('password')} error={form.formState.errors.password?.message} />
      {mutation.isError && <FormAlert>{errorMessage(mutation.error)}</FormAlert>}
      <Button className="w-full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-sky-800 hover:underline" to="/login">Sign in</Link></p>
    </form>
  </AuthCard>;
}
