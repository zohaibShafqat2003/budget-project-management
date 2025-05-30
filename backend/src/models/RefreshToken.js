const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    hashedToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    userAgent: {
      type: DataTypes.STRING
    },
    createdByIp: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['token'] },
      { fields: ['hashedToken'] },
      { fields: ['expiresAt'] }
    ],
    hooks: {
      beforeCreate: async (refreshToken) => {
        // Set default expiration if not provided
        if (!refreshToken.expiresAt) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // Default to 7 days
          refreshToken.expiresAt = expiresAt;
        }
        
        // Hash the token
        if (refreshToken.token) {
          const salt = await bcrypt.genSalt(10);
          refreshToken.hashedToken = await bcrypt.hash(refreshToken.token, salt);
        }
      }
    }
  });

  // Instance method to check if token is expired
  RefreshToken.prototype.isExpired = function() {
    return new Date() >= this.expiresAt;
  };

  // Instance method to check if token is active
  RefreshToken.prototype.isActive = function() {
    return !this.isRevoked && !this.isExpired();
  };

  // Instance method to verify token
  RefreshToken.prototype.verifyToken = async function(token) {
    return await bcrypt.compare(token, this.hashedToken);
  };

  return RefreshToken;
}; 