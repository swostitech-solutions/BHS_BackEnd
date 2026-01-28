"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Insert services first
    await queryInterface.bulkInsert(
      "services",
      [
        {
          service_code: "A10001",
          name: "Plumbing",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        {
          service_code: "A10002",
          name: "Electrical",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    // Insert subservices next
    await queryInterface.bulkInsert(
      "subservices",
      [
        {
          subservice_code: "A10001-01",
          service_code: "A10001",
          name: "Tap Repair",
          price: 199,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10001-02",
          service_code: "A10001",
          name: "Pipe Replacement",
          price: 499,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10002-01",
          service_code: "A10002",
          name: "Fan Installation",
          price: 299,
          createdAt: now,
          updatedAt: now,
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("subservices", null, {});
    await queryInterface.bulkDelete("services", null, {});
  },
};
