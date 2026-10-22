import { expect, test } from 'bun:test'
import {
  monthlyRevenue,
  totalValues,
  weeklyRevenue,
} from '../../shared/utils/analytics'

test('chart totals describe exactly the plotted data for both periods', () => {
  expect(totalValues(weeklyRevenue)).toBe(3160)
  expect(totalValues(monthlyRevenue)).toBe(38100)
  expect(totalValues([])).toBe(0)
})
