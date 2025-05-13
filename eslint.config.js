import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat(
);

export default [
  ...compat.extends('react-app'),
  ...compat.extends('react-app/jest'),
];