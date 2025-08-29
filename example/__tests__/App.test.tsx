/**
 * @format
 */

import { render, cleanup } from '@testing-library/react-native';
import App from '../src/App';

afterEach(() => {
  cleanup();
});

test('renders correctly', () => {
  render(<App />);
});
