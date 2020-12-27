// Seed and update model into table
const Banner = require('./banner');
Banner.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table banner updated!`)
    })

const Category = require('./category');
Category.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table category updated!`)
    })

const haiUser = require('./haiuser');
haiUser.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table hai user updated!`)
    })

const infoCode = require('./infoCode');
infoCode.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table info code updated!`)
    })

const partnerAwards = require('./partnerawards');
partnerAwards.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner award updated!`)
    })

const partnerBankAccount = require('./partnerbankaccount');
partnerBankAccount.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner bank account updated!`)
    })

const partnerCategory = require('./partnerCategory');
partnerCategory.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner category updated!`)
    })

const partnerCertificate = require('./partnercertificate');
partnerCertificate.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner certificate updated!`)
    })

const partnerExperience = require('./partnerexperience');
partnerExperience.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner experience updated!`)
    })

const partnerFollower = require('./partnerFollower');
partnerFollower.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner follower updated!`)
    })

const partnerPackageDetail = require('./partnerPackageDetail');
partnerPackageDetail.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner package detail updated!`)
    })

const partnerPackageHeader = require('./partnerPackageHeader');
partnerPackageHeader.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner package header updated!`)
    })

const partnerPortfolio = require('./partnerportfolio');
partnerPortfolio.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner portfolio updated!`)
    })

const partnerRating = require('./partnerRating');
partnerRating.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner rating updated!`)
    })

const partnerWalletBalance = require('./partnerwalletbalance');
partnerWalletBalance.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner wallet balance updated!`)
    })

const partnerWalletHistory = require('./partnerwallethistory');
partnerWalletHistory.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table partner wallet history updated!`)
    })

const payment = require('./payment');
payment.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table payment updated!`)
    })

const paymentChannel = require('./paymentchannel');
paymentChannel.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table payment channel updated!`)
    })

const paymentDetail = require('./paymentdetail');
paymentDetail.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table payment detail updated!`)
    })

const reservation = require('./reservation');
reservation.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table reservation updated!`)
    })

const reservationContact = require('./reservationcontact');
reservationContact.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table reservation contact updated!`)
    })

const reservationService = require('./reservationservice');
reservationService.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table reservation service updated!`)
    })

const reservationStatusHistory = require('./reservationstatushistory');
reservationStatusHistory.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table reservation status history updated!`)
    })

const service = require('./service');
service.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table service updated!`)
    })

const subService = require('./subservice');
subService.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`Table sub service updated!`)
    })