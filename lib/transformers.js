module.exports = {
    user: (row) => {
      return {
        id: row.id,
        email: row.email,
        refresh_token: row.refresh_token,
        phone_number: row.phone_number,
        name: row.name,
        type: row.type,
        is_admin: row.is_admin,
        admin_role: row.admin_role,
      }
    },

    resetToken: (row) => {
      return {
        email: row.email,
        token_expired: row.reset_token,
      }
    },
  };
  
