// // Seed and update model into table
// const Banner = require('./banner');
// Banner.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table banner updated!`)
//     })

// const Category = require('./category');
// Category.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table category updated!`);

//         // Seed value
//         Category.bulkCreate([
//             {
//                 id: 1,
//                 name: "MUA",
//                 description: "Makeup Artist Category",
//                 order_no: 1,
//                 active: 1
//             },
//             {
//                 id: 2,
//                 name: "Hairdo",
//                 description: "Hairdo Stylist Category",
//                 order_no: 2,
//                 active: 1
//             },
//             {
//                 id: 3,
//                 name: "Hijabdo",
//                 description: "Hijab Stylist Category",
//                 order_no: 3,
//                 active: 1
//             },
//             {
//                 id: 4,
//                 name: "Henna Art",
//                 description: "Henna Artist Category",
//                 order_no: 4,
//                 active: 1
//             },
//             {
//                 id: 5,
//                 name: "Photography",
//                 description: "Photography Category",
//                 order_no: 5,
//                 active: 1
//             },
//             {
//                 id: 6,
//                 name: "Catering",
//                 description: "Catering Category",
//                 order_no: 6,
//                 active: 1
//             },
//             {
//                 id: 7,
//                 name: "Event",
//                 description: "Event Category",
//                 order_no: 7,
//                 active: 1
//             },
//             {
//                 id: 8,
//                 name: "Decoration",
//                 description: "Decoration Category",
//                 order_no: 8,
//                 active: 1
//             },
//             {
//                 id: 9,
//                 name: "MC",
//                 description: "MC Category",
//                 order_no: 9,
//                 active: 1
//             },
//             {
//                 id: 10,
//                 name: "Entertainment",
//                 description: "Entertainment Category",
//                 order_no: 10,
//                 active: 1
//             },
//             {
//                 id: 11,
//                 name: "Venue",
//                 description: "Venue Category",
//                 order_no: 11,
//                 active: 1
//             }
//         ]);
//     })

// const haiUser = require('./haiuser');
// haiUser.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table hai user updated!`)
//     })

// const infoCode = require('./infoCode');
// infoCode.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table info code updated!`)
//     })

// const partnerAwards = require('./partnerawards');
// partnerAwards.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner award updated!`)
//     })

// const partnerBankAccount = require('./partnerbankaccount');
// partnerBankAccount.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner bank account updated!`)
//     })

// const partnerCategory = require('./partnerCategory');
// partnerCategory.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner category updated!`)
//     })

// const partnerCertificate = require('./partnercertificate');
// partnerCertificate.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner certificate updated!`)
//     })

// const partnerExperience = require('./partnerexperience');
// partnerExperience.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner experience updated!`)
//     })

// const partnerFollower = require('./partnerFollower');
// partnerFollower.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner follower updated!`)
//     })

// const partnerPackageDetail = require('./partnerPackageDetail');
// partnerPackageDetail.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner package detail updated!`)
//     })

// const partnerPackageHeader = require('./partnerPackageHeader');
// partnerPackageHeader.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner package header updated!`)
//     })

// const partnerPortfolio = require('./partnerportfolio');
// partnerPortfolio.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner portfolio updated!`)
//     })

// const partnerRating = require('./partnerRating');
// partnerRating.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner rating updated!`)
//     })

// const partnerWalletBalance = require('./partnerwalletbalance');
// partnerWalletBalance.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner wallet balance updated!`)
//     })

// const partnerWalletHistory = require('./partnerwallethistory');
// partnerWalletHistory.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table partner wallet history updated!`)
//     })

// const payment = require('./payment');
// payment.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table payment updated!`)
//     })

// const paymentChannel = require('./paymentchannel');
// paymentChannel.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table payment channel updated!`)
//     })

// const paymentDetail = require('./paymentdetail');
// paymentDetail.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table payment detail updated!`)
//     })

// const reservation = require('./reservation');
// reservation.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table reservation updated!`)
//     })

// const reservationContact = require('./reservationcontact');
// reservationContact.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table reservation contact updated!`)
//     })

// const reservationService = require('./reservationservice');
// reservationService.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table reservation service updated!`)
//     })

// const reservationStatusHistory = require('./reservationstatushistory');
// reservationStatusHistory.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table reservation status history updated!`)
//     })

// const service = require('./service');
// service.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table service updated!`);

//         // Seed value
//         // MUA Service
//         service.bulkCreate([
//             {
//                 id: 1,
//                 name: "Wedding",
//                 description: "MUA Wedding Service",
//                 category_id: 1,
//             },
//             {
//                 id: 2,
//                 name: "Pre Wedding",
//                 description: "MUA Pre Wedding Service",
//                 category_id: 1,
//             },
//             {
//                 id: 3,
//                 name: "Party",
//                 description: "MUA Pre Wedding Service",
//                 category_id: 1,
//             },
//             {
//                 id: 4,
//                 name: "Photoshoot",
//                 description: "MUA Photoshoot Service",
//                 category_id: 1,
//             },
//             {
//                 id: 5,
//                 name: "Nakeup Class",
//                 description: "MUA Beauty Class Service",
//                 category_id: 1,
//             },
//         ]);

//         // Hairdo Service
//         service.bulkCreate([
//             {
//                 id: 6,
//                 name: "Wedding",
//                 description: "Hairdo Wedding Service",
//                 category_id: 2,
//             },
//             {
//                 id: 7,
//                 name: "Pre Wedding",
//                 description: "Hairdo Pre Wedding Service",
//                 category_id: 2,
//             },
//             {
//                 id: 8,
//                 name: "Party",
//                 description: "Hairdo Party Service",
//                 category_id: 2,
//             },
//             {
//                 id: 9,
//                 name: "Photoshoot",
//                 description: "Hairdo Photoshoot Service",
//                 category_id: 2,
//             },
//             {
//                 id: 10,
//                 name: "Hairdo Class",
//                 description: "Hairdo Beauty Class Service",
//                 category_id: 2,
//             },
//         ]);

//         // Hijabdo Service
//         service.bulkCreate([
//             {
//                 id: 11,
//                 name: "Wedding",
//                 description: "Hijabdo Wedding Service",
//                 category_id: 3,
//             },
//             {
//                 id: 12,
//                 name: "Pre Wedding",
//                 description: "Hijabdo Pre Wedding Service",
//                 category_id: 3,
//             },
//             {
//                 id: 13,
//                 name: "Party",
//                 description: "Hijabdo Party Service",
//                 category_id: 3,
//             },
//             {
//                 id: 14,
//                 name: "Photoshoot",
//                 description: "Hijabdo Photoshoot Service",
//                 category_id: 3
//             },
//             {
//                 id: 15,
//                 name: "Hijabdo Class",
//                 description: "Hijabdo Beauty Class Service",
//                 category_id: 3,
//             },
//         ]);

//         // Henna Art Service
//         service.bulkCreate([
//             {
//                 id: 16,
//                 name: "Wedding",
//                 description: "Henna Wedding Service",
//                 category_id: 4,
//             },
//             {
//                 id: 17,
//                 name: "Party",
//                 description: "Henna Party Service",
//                 category_id: 4,
//             },
//             {
//                 id: 18,
//                 name: "Photoshoot",
//                 description: "Henna Photoshoot Service",
//                 category_id: 4,
//             },
//             {
//                 id: 19,
//                 name: "Henna Class",
//                 description: "Henna Class Service",
//                 category_id: 4,
//             }
//         ]);

//         // Photography Service
//         service.bulkCreate([
//             {
//                 id: 20,
//                 name: "Wedding",
//                 description: "Photography Wedding Service",
//                 category_id: 5,
//             },
//             {
//                 id: 21,
//                 name: "Party",
//                 description: "Photography Party Service",
//                 category_id: 5,
//             },
//             {
//                 id: 22,
//                 name: "Gathering",
//                 description: "Photography Gathering Service",
//                 category_id: 5,
//             },
//             {
//                 id: 23,
//                 name: "Exhibition",
//                 description: "Photography Exhibition Service",
//                 category_id: 5,
//             },
//             {
//                 id: 24,
//                 name: "Event",
//                 description: "Photography Event Service",
//                 category_id: 5,
//             }
//         ]);

//         // Catering Service
//         service.bulkCreate([
//             {
//                 id: 25,
//                 name: "Wedding",
//                 description: "Catering Wedding Service",
//                 category_id: 6,
//             },
//             {
//                 id: 26,
//                 name: "Party",
//                 description: "Catering Party Service",
//                 category_id: 6,
//             },
//             {
//                 id: 27,
//                 name: "Gathering",
//                 description: "Catering Gathering Service",
//                 category_id: 6,
//             },
//             {
//                 id: 28,
//                 name: "Exhibition",
//                 description: "Catering Exhibition Service",
//                 category_id: 6,
//             },
//             {
//                 id: 29,
//                 name: "Event",
//                 description: "Catering Event Service",
//                 category_id: 6
//             }
//         ]);

//         // Event Service
//         service.bulkCreate([
//             {
//                 id: 30,
//                 name: "Wedding",
//                 description: "Event Wedding Service",
//                 category_id: 7,
//             },
//             {
//                 id: 31,
//                 name: "Party",
//                 description: "Event Party Service",
//                 category_id: 7,
//             },
//             {
//                 id: 32,
//                 name: "Gathering",
//                 description: "Event Gathering Service",
//                 category_id: 7,
//             },
//             {
//                 id: 33,
//                 name: "Exhibition",
//                 description: "Event Exhibition Service",
//                 category_id: 7,
//             },
//             {
//                 id: 34,
//                 name: "Seminar",
//                 description: "Event Seminar Service",
//                 category_id: 7,
//             },
//             {
//                 id: 35,
//                 name: "Workshop",
//                 description: "Event Workshop Service",
//                 category_id: 7,
//             },
//             {
//                 id: 36,
//                 name: "Lainnya",
//                 description: "Other Event Service",
//                 category_id: 7,
//             }
//         ]);
        
//         // Decoration Service
//         service.bulkCreate([
//             {
//                 id: 37,
//                 name: "Wedding",
//                 description: "Decoration Wedding Service",
//                 category_id: 8,
//             },
//             {
//                 id: 38,
//                 name: "Party",
//                 description: "Decoration Party Service",
//                 category_id: 8,
//             },
//             {
//                 id: 39,
//                 name: "Meeting",
//                 description: "Decoration Meeting Service",
//                 category_id: 8,
//             },
//             {
//                 id: 40,
//                 name: "Gathering",
//                 description: "Decoration Gathering Service",
//                 category_id: 8,
//             },
//             {
//                 id: 41,
//                 name: "Exhibition",
//                 description: "Decoration Exhibition Service",
//                 category_id: 8,
//             },
//             {
//                 id: 42,
//                 name: "Event",
//                 description: "Decoration Event Service",
//                 category_id: 8,
//             }
//         ]);

//         // MC Service
//         service.bulkCreate([
//             {
//                 id: 43,
//                 name: "Wedding",
//                 description: "MC Wedding Service",
//                 category_id: 9,
//             },
//             {
//                 id: 44,
//                 name: "Party",
//                 description: "MC Party Service",
//                 category_id: 9,
//             },
//             {
//                 id: 45,
//                 name: "Gathering",
//                 description: "MC Gathering Service",
//                 category_id: 9,
//             },
//             {
//                 id: 46,
//                 name: "Exhibition",
//                 description: "MC Exhibition Service",
//                 category_id: 9,
//             },
//             {
//                 id: 47,
//                 name: "Event",
//                 description: "MC Event Service",
//                 category_id: 9,
//             }
//         ]);

//         // Entertainment Service
//         service.bulkCreate([
//             {
//                 id: 48,
//                 name: "Wedding",
//                 description: "Entertainment Wedding Service",
//                 category_id: 10,
//             },
//             {
//                 id: 49,
//                 name: "Party",
//                 description: "Entertainment Party Service",
//                 category_id: 10,
//             },
//             {
//                 id: 50,
//                 name: "Gathering",
//                 description: "Entertainment Gathering Service",
//                 category_id: 10,
//             },
//             {
//                 id: 51,
//                 name: "Exhibition",
//                 description: "Entertainment Exhibition Service",
//                 category_id: 10,
//             },
//             {
//                 id: 52,
//                 name: "Event",
//                 description: "Entertainment Event Service",
//                 category_id: 10,
//             }
//         ]);

//         // Venue Service
//         service.bulkCreate([
//             {
//                 id: 53,
//                 name: "Wedding",
//                 description: "Venue Wedding Service",
//                 category_id: 11,
//             },
//             {
//                 id: 54,
//                 name: "Party",
//                 description: "Venue Party Service",
//                 category_id: 11
//             },
//             {
//                 id: 55,
//                 name: "Gathering",
//                 description: "Venue Gathering Service",
//                 category_id: 11,
//             },
//             {
//                 id: 56,
//                 name: "Exhibition",
//                 description: "Venue Exhibition Service",
//                 category_id: 11,
//             },
//             {
//                 id: 57,
//                 name: "Event",
//                 description: "Venue Event Service",
//                 category_id: 11,
//             }
//         ]);
//     })

// const subService = require('./subservice');
// subService.sequelize.sync({ alter: true })
//     .then(() => {
//         console.log(`Table sub service updated!`)
//     })