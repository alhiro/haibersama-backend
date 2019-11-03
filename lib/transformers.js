module.exports = {
    user: (row) => {
      return {
        id: row.id,
        email: row.email,
        refresh_token: row.refresh_token,
        phone_number: row.phone_number,
        type: 'user',
      }
    },
  };
  