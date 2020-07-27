
const jwt = require('../lib/jwt')
const moment = require('moment')

class StoreHelper {
    async generateUserData({ company_email, password, company_name, address, city, zip_code, phone, company_logo }, storeid) {
      // user must wait for administrative process before could login, maximum 24 hours after registration
      const generateActivateAt = moment().utcOffset(7).add(24, "hours").format("YYYY-MM-DD HH:mm:ss");
      const generateHashPassword = await jwt.hash(password, 10)
      return {
        company_email,
        password: generateHashPassword,
        active_at: generateActivateAt,
        company_name,
        address,
        city,
        zip_code,
        phone,
        company_logo,
        active: 1,
        storeid
      }
    }
}

module.exports = StoreHelper
