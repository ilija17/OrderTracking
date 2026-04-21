import { seedAdminIfEmpty } from '../utils/seed'

export default defineNitroPlugin(async () => {
  await seedAdminIfEmpty()
})
