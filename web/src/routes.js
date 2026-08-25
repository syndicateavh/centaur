import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.jsx'),
  route('courses', 'routes/courses.jsx'),
  route('courses/investment-banking-operations', 'routes/investment-banking-operations.jsx'),
  route('courses/retail-banking', 'routes/retail-banking.jsx'),
  route('courses/finance-operations', 'routes/finance-operations.jsx'),
  route('placements', 'routes/placements.jsx'),
  route('about', 'routes/about.jsx'),
  route('contact', 'routes/contact.jsx'),
  route('404', 'routes/not-found.jsx'),
  route('*', 'routes/catch-all.jsx'),
];
