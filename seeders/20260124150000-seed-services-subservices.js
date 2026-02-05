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
          description: "All plumbing repair and installation services",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        {
          service_code: "A10002",
          name: "Electrical",
          description: "Electrical repair and installation services",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        {
          service_code: "A10003",
          name: "AC Repair",
          description: "Air conditioning repair and maintenance",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        {
          service_code: "A10004",
          name: "Cleaning",
          description: "Home and office cleaning services",
          status: "ACTIVE",
          createdAt: now,
          updatedAt: now,
        },
      ],
      { ignoreDuplicates: true }
    );

    // Get service IDs for FK references
    const [services] = await queryInterface.sequelize.query(
      `SELECT id, service_code FROM services WHERE service_code IN ('A10001', 'A10002', 'A10003', 'A10004')`
    );

    const serviceMap = {};
    services.forEach(s => { serviceMap[s.service_code] = s.id; });

    // Insert subservices with correct service_id FK
    await queryInterface.bulkInsert(
      "subservices",
      [
        // Plumbing subservices
        {
          subservice_code: "A10001-01",
          service_id: serviceMap["A10001"],
          name: "Tap Repair",
          description: "Fix leaking or broken taps",
          price: 199,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10001-02",
          service_id: serviceMap["A10001"],
          name: "Pipe Replacement",
          description: "Replace old or damaged pipes",
          price: 499,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10001-03",
          service_id: serviceMap["A10001"],
          name: "Toilet Repair",
          description: "Fix toilet flush and leakage issues",
          price: 349,
          createdAt: now,
          updatedAt: now,
        },
        // Electrical subservices
        {
          subservice_code: "A10002-01",
          service_id: serviceMap["A10002"],
          name: "Fan Installation",
          description: "Install ceiling or wall fans",
          price: 299,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10002-02",
          service_id: serviceMap["A10002"],
          name: "Switch/Socket Repair",
          description: "Replace faulty switches and sockets",
          price: 149,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10002-03",
          service_id: serviceMap["A10002"],
          name: "Wiring Work",
          description: "Electrical wiring and cabling",
          price: 599,
          createdAt: now,
          updatedAt: now,
        },
        // AC Repair subservices
        {
          subservice_code: "A10003-01",
          service_id: serviceMap["A10003"],
          name: "AC Gas Refill",
          description: "Refill AC refrigerant gas",
          price: 1499,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10003-02",
          service_id: serviceMap["A10003"],
          name: "AC Servicing",
          description: "Complete AC cleaning and maintenance",
          price: 599,
          createdAt: now,
          updatedAt: now,
        },
        // Cleaning subservices
        {
          subservice_code: "A10004-01",
          service_id: serviceMap["A10004"],
          name: "Deep Cleaning",
          description: "Thorough home deep cleaning",
          price: 2499,
          createdAt: now,
          updatedAt: now,
        },
        {
          subservice_code: "A10004-02",
          service_id: serviceMap["A10004"],
          name: "Kitchen Cleaning",
          description: "Professional kitchen cleaning",
          price: 799,
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
