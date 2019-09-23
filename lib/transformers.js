module.exports = {
    user: (row) => {
      return {
        id: row.id,
        storeid: row.storeid,
        company_email: row.company_email,
        refresh_token: row.refresh_token,
        phone: row.phone,
        forgot_password_code: row.forgot_password_code,
        type: 'user',
      }
    },
  };
  