// File: backend/seed.js
require('dotenv').config();

// 1) Direct import of database configuration 
const { sequelize } = require('./src/config/db'); // DataTypes may not be needed directly here anymore

// 2) Import models by passing (sequelize, DataTypes)
// Import models used directly by seed.js for bulkCreate from models/index.js
// models/index.js handles their definitions and associations.
const {
  User,
  Project,
  Client,
  BudgetItem, // Assuming used for bulkCreate later in this file
  Expense,    // Assuming used for bulkCreate later in this file
  ProjectMember
} = require('./src/models');
// Note: Board, Sprint, Story, Task, Epic are not imported here at the top level of seed.js
// because seedProjectData (imported next) handles its own model imports from ../models.

// Import the new seeder function
const seedProjectData = require('./src/seeders/seedProject');

// Associations are defined and handled by models/index.js.
// The loop that called model.associate() has been removed to prevent conflicts.

(async () => {
  try {
    console.log('🔄 Starting seed script…');

    // 4) In development, force‐sync the schema (drop & recreate). Remove { force: true } in production!
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synchronized (force: true)');

    //
    // ─── 5) Create dummy Users ────────────────────────────────────────────────────────────────
    console.log('⏳ Creating dummy users…');
    const usersData = [
      {
        id: 'a1a1a1a1-1111-1111-1111-111111111111',
        firstName: 'Alice',
        lastName: 'Admin',
        email: 'alice.admin@example.com',
        password: 'Admin123!', // hashed by model hook
        role: 'Admin',
      },
      {
        id: 'b2b2b2b2-2222-2222-2222-222222222222',
        firstName: 'Bob',
        lastName: 'Developer',
        email: 'bob.dev@example.com',
        password: 'Dev123!',
        role: 'Developer',
      },
    ];
    await User.bulkCreate(usersData);
    console.log(`✅ ${usersData.length} dummy users created.`);

    //
    // ─── 6) Seed Clients ─────────────────────────────────────────────────────────────────────
    console.log('⏳ Creating clients…');
    const clientsData = [
      {
        id: 'c3c3c3c3-1111-1111-1111-111111111111',
        name: 'IDAP',
        email: 'contact@idap.org',
        country: 'Pakistan',
        city: 'Rajanpur',
        industry: 'Healthcare',
        notes: 'Client for Mother & Child Hospital EIA',
      },
      {
        id: 'd4d4d4d4-2222-2222-2222-222222222222',
        name: 'Pakistan Public Works Department',
        email: 'info@ppwd.gov.pk',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Government',
        notes: 'Client for ECP EIA',
      },
      {
        id: 'e5e5e5e5-3333-3333-3333-333333333333',
        name: 'Mr. Umar Shareef',
        email: 'umar.shareef@example.com',
        country: 'Pakistan',
        city: 'Janjora, Kotli, AJK',
        industry: 'Mining',
        notes: 'Dolomite Exploration Client',
      },
      {
        id: '66666666-4444-4444-4444-444444444444',
        name: 'Brothers Construction Pvt. Ltd',
        email: 'brothers@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Construction',
        notes: 'Solid Waste Management & Compliance Reports',
      },
      {
        id: '77777777-5555-5555-5555-555555555555',
        name: 'M/s MGC Real Estate Builders and Developers Pvt Ltd',
        email: 'mgc@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Real Estate',
        notes: 'Client for Zaraj Housing Scheme IEE',
      },
      {
        id: '88888888-6666-6666-6666-666666666666',
        name: 'M/s FG Investments',
        email: 'fg@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Investments',
        notes: 'Client for The Garden Residence EIA',
      },
      {
        id: '99999999-7777-7777-7777-777777777777',
        name: 'Brothers Construction Pvt. Ltd',
        email: 'brothers@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Construction',
        notes: 'Client for Al Makkah City Compliance Report',
      },
      {
        id: 'aaaaaaaa-8888-8888-8888-888888888888',
        name: 'Rawalpindi Chamber of Commerce & Industry',
        email: 'rcci@example.com',
        country: 'Pakistan',
        city: 'Rawalpindi',
        industry: 'Commerce',
        notes: 'Client for Women Entrepreneurs Display Centre TIA',
      },
      {
        id: 'bbbbbbbb-9999-9999-9999-999999999999',
        name: 'M/s A&H Developers',
        email: 'ah@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Development',
        notes: 'Client for Mall of B-17 IEE',
      },
      {
        id: 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Mr. Arbaz Khan',
        email: 'arbaz.khan@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Consultancy',
        notes: 'Client for Magnolia Mall TIA',
      },
    ];
    await Client.bulkCreate(clientsData);
    console.log('✅ Clients created.');

    //
    // ─── 7) Seed Projects (10 real + 2 dummy) ─────────────────────────────────────────────────
    console.log('⏳ Creating projects…');
    const projectsData = [
      {
        // Project 1
        id: 'f6f6f6f6-1111-1111-1111-111111111111',
        projectIdStr: 'EIA-001',
        name: 'EIA of 200 Bedded Mother and Child Hospital',
        duration: '1',
        startDate: new Date('2023-01-23'),
        completionDate: new Date('2023-04-23'),
        approxValueOfServices: 1.6,
        narrativeDescription:
          'The Mother & Child Care Hospital in Rajanpur will comprise a bed strength of 200 beds. ' +
          'The approximate covered area of the hospital building is 410,206.64 sq. ft. This project is targeted to the public, ' +
          'to boost their confidence in the primary health care system. This will also enable them to obtain the requisite medical ' +
          'treatment to live a healthy life and play a positive role in the country\'s progress. Additionally, it will provide ' +
          'services to adjacent districts and tribal areas as currently there is no mother & child hospital in the region.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts ' +
          'during Pre-Construction, Construction and Operational phases of the Project; Proposed mitigation measures to minimize, ' +
          'eliminate or compensate the potential adverse impacts identified; Assessed compliance of mitigation measures given in the EIA; ' +
          'Prepared Environmental Compliance Monitoring Report of the project.',
        clientId: 'c3c3c3c3-1111-1111-1111-111111111111', // IDAP
        country: 'Pakistan',
        city: 'Rajanpur',
        nameOfClient: 'IDAP',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      {
        // Project 2
        id: 'f7f7f7f7-2222-2222-2222-222222222222',
        projectIdStr: 'ECP-002',
        name: 'EIA of Election Commission of Pakistan (ECP) Project, Sector H-11/4, Islamabad',
        duration: '1.0 months',
        startDate: new Date('2023-03-23'),
        completionDate: new Date('2023-04-23'),
        approxValueOfServices: 0.65,
        narrativeDescription:
          'Election Commission of Pakistan is responsible for conducting free, fair and impartial elections. ' +
          'Currently, ECP uses a temporary rooftop facility for its Federal Election Academy, which is inadequate. ' +
          'CDA allotted a 5000 sq. yd. plot in H-11/4, Islamabad to build a new Academy and offices.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted community consultations; Identified and assessed major/minor impacts during Pre-Construction, Construction, ' +
          'and Operational phases; Proposed mitigation measures; Assessed compliance with mitigation; Prepared Environmental ' +
          'Compliance Monitoring Report.',
        clientId: 'd4d4d4d4-2222-2222-2222-222222222222', // PPPWD
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Pakistan Public Works Department',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      {
        // Project 3
        id: 'f8f8f8f8-3333-3333-3333-333333333333',
        projectIdStr: 'IEE-003',
        name: 'Initial Environmental Examination of Majmooha Zamzam Dolomite Exploration, Extraction and Processing Unit, Janjora, Kotli AJK',
        duration: '1',
        startDate: new Date('2023-01-23'),
        completionDate: new Date('2023-02-23'),
        approxValueOfServices: 0.0,
        narrativeDescription:
          'Purpose: Provide dolomite aggregate to Kotli\'s construction industry at an affordable price.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the area; ' +
          'Identified/assessed major/minor impacts during Pre-construction, Construction, and Operation phases; ' +
          'Identified significant impacts needing detailed assessment; Proposed mitigation measures; ' +
          'Prepared Environmental Mitigation & Monitoring Plan; Prepared Plantation Plan; ' +
          'Prepared IEE Report.',
        clientId: 'e5e5e5e5-3333-3333-3333-333333333333', // Mr. Umar Shareef
        country: 'Pakistan',
        city: 'Janjora, Kotli, AJK',
        nameOfClient: 'Mr. Umar Shareef',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      {
        // Project 4
        id: 'f9f9f9f9-4444-4444-4444-444444444444',
        projectIdStr: 'SWM-004',
        name: 'Solid Waste Management Plan of Al Makkah City Project, Zone V, Islamabad',
        duration: '1',
        startDate: new Date('2023-02-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.3,
        narrativeDescription:
          'M/s Brothers Construction Pvt. Ltd. intends to develop a modern housing society on Mehfooz Shaheed Road. ' +
          'Solid waste management plan aims to minimize environmental impacts.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic); Conducted community consultations; ' +
          'Identified and assessed major/minor impacts during Construction & Operational phases; Proposed mitigation measures; ' +
          'Prepared Environmental Mitigation & Monitoring Plan; Prepared Plantation Plan; Prepared IEE.',
        clientId: '66666666-4444-4444-4444-444444444444', // Brothers Construction
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Brothers Construction Pvt. Ltd',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      {
        // Project 5
        id: 'fafafafa-5555-5555-5555-555555555555',
        projectIdStr: 'IEE-005',
        name: 'IEE of Rania Heights, Zaraj Housing Scheme, Islamabad',
        duration: '1',
        startDate: new Date('2022-12-22'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 1.2,
        narrativeDescription:
          'M/s MGC Real Estate Builders intends to regularize a high-rise residential apartment building in Sector A of Zaraj Housing Scheme, Islamabad. ' +
          'Project consists of three 8‐story blocks (358 total apartments).',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted community consultations; Identified and assessed major/minor impacts during Pre-Construction, Construction & Operational phases; ' +
          'Proposed mitigation measures; Assessed compliance with mitigation; Prepared Environmental Compliance Monitoring Report.',
        clientId: '77777777-5555-5555-5555-555555555555', // M/s MGC Real Estate
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'M/s MGC Real Estate Builders and Developers Pvt Ltd',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      {
        // Project 6
        id: 'fbfbfbfb-6666-6666-6666-666666666666',
        projectIdStr: 'EIA-006',
        name: 'EIA of The Garden Residence Project, Islamabad',
        duration: '1',
        startDate: new Date('2023-01-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.8,
        narrativeDescription:
          'M/s FG Investments intends to construct a high-rise residential apartment building in F-10 Markaz, Islamabad. ' +
          'Project consists of two towers (26 & 41 floors) with 326 housing units.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted community consultations; Identified and assessed major/minor impacts during Pre-Construction, Construction & Operational phases; ' +
          'Proposed mitigation measures; Assessed compliance with mitigation; Prepared Environmental Compliance Monitoring Report.',
        clientId: '88888888-6666-6666-6666-666666666666', // M/s FG Investments
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'M/s FG Investments',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      {
        // Project 7
        id: 'fcfcfcfc-7777-7777-7777-777777777777',
        projectIdStr: 'PCR-007',
        name: 'Project Compliance Report of Al Makkah City Project, Islamabad',
        duration: '5',
        startDate: new Date('2022-11-22'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.15,
        narrativeDescription:
          'M/s Brothers Construction Pvt. Ltd. intends to develop a modern housing society on Mehfooz Shaheed Road. ' +
          'This compliance report analyzes implemented mitigation measures from the original EIA.',
        actualServicesDescription:
          'The services included: Tabulated compliance of EMP conditions and Environmental Approval.',
        clientId: '99999999-7777-7777-7777-777777777777', // Brothers Construction
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Brothers Construction Pvt. Ltd',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      {
        // Project 8
        id: 'fdfdfdfd-8888-8888-8888-888888888888',
        projectIdStr: 'TIA-008',
        name: 'TIA of Display Centre for Women Entrepreneurs/SMEs of the Rawalpindi Chamber of Commerce & Industry',
        duration: '1',
        startDate: new Date('2023-03-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.5,
        narrativeDescription:
          'Display Centre for Women Entrepreneurs/SMEs is located at plot 39/A, 39/B & 1B Civil Line, Rashid Minhas Road, Rawalpindi. ' +
          'TIA assessed traffic impact on Rashid Minhas Road. Annual traffic growth assumed at 10%, found manageable.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted community consultations; Identified and assessed major/minor impacts during Pre-Construction, Construction & Operational phases; ' +
          'Proposed mitigation measures; Assessed traffic flow & influx; Prepared TIA report.',
        clientId: 'aaaaaaaa-8888-8888-8888-888888888888', // RCCI
        country: 'Pakistan',
        city: 'Rawalpindi',
        nameOfClient: 'Rawalpindi Chamber of Commerce & Industry',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      {
        // Project 9
        id: 'fefefefe-9999-9999-9999-999999999999',
        projectIdStr: 'IEE-009',
        name: 'IEE of Mall of B-17 Project, Sector B-17, Islamabad',
        duration: '1',
        startDate: new Date('2023-02-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.8,
        narrativeDescription:
          'M/s A&H Developers intend to develop a mall in Sector B-17, Islamabad (107,640 sq. ft., 4 stories), including ' +
          'parking for 415 cars and 218 bikes. Project cost is PKR 995 million, completion in 4 years.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted community consultations; Identified and assessed major/minor impacts during Pre-Construction, Construction & Operational phases; ' +
          'Proposed mitigation measures; Prepared Environmental Compliance Monitoring Report.',
        clientId: 'bbbbbbbb-9999-9999-9999-999999999999', // A&H Developers
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'M/s A&H Developers',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      {
        // Project 10
        id: 'f0f0f0f0-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        projectIdStr: 'TIA-010',
        name: 'TIA of Magnolia Mall and Residence Project, GT Road, Mouza Jhangi Syedan, Islamabad',
        duration: '1',
        startDate: new Date('2023-02-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.3,
        narrativeDescription:
          'Magnolia Mall & Residence Project is at GT Road, Mouza Jhangi Syedan, Islamabad on 11 Kanals, 5 Marlas. ' +
          'TIA assessed traffic impact on GT Road, annual growth 10%, found manageable.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted community consultations; Identified and assessed major/minor impacts during Pre-Construction, Construction & Operational phases; ' +
          'Proposed mitigation measures; Assessed traffic flow & influx; Prepared TIA report.',
        clientId: 'cccccccc-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Mr. Arbaz Khan
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Mr. Arbaz Khan',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      {
        // DUMMY 11
        id: 'f1f1f1f1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        projectIdStr: 'DUMMY-011',
        name: 'Dummy Infrastructure Upgrade Project',
        duration: '3',
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2024-04-15'),
        approxValueOfServices: 2.5,
        narrativeDescription:
          'This is a dummy entry for an infrastructure upgrade project that involves road widening and drainage improvements.',
        actualServicesDescription:
          'The services included: Baseline survey, environmental assessment, stakeholder consultation, mitigation planning, compliance monitoring.',
        clientId: 'c3c3c3c3-1111-1111-1111-111111111111', // IDAP
        country: 'Pakistan',
        city: 'Lahore',
        nameOfClient: 'IDAP',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      {
        // DUMMY 12
        id: 'f2f2f2f2-cccc-cccc-cccc-cccccccccccc',
        projectIdStr: 'DUMMY-012',
        name: 'Dummy Renewable Energy Feasibility Study',
        duration: '2',
        startDate: new Date('2024-05-01'),
        completionDate: new Date('2024-07-01'),
        approxValueOfServices: 1.1,
        narrativeDescription:
          'Feasibility study for a 50 MW solar PV plant in southern Pakistan, including land use, grid assessment, and environmental impacts.',
        actualServicesDescription:
          'The services included: Site inspection, baseline data collection, solar irradiance analysis, stakeholder consultation, mitigation plan, final feasibility report.',
        clientId: 'd4d4d4d4-2222-2222-2222-222222222222', // PPPWD
        country: 'Pakistan',
        city: 'Karachi',
        nameOfClient: 'Pakistan Public Works Department',
        type: 'Scrum',
        status: 'Active',
        progress: 0,
        priority: 'Medium',
        totalBudget: 0,
        usedBudget: 0,
        metadata: {},
        ownerId: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
    ];
    await Project.bulkCreate(projectsData);
    console.log(`✅ ${projectsData.length} projects created.`);

    //
    // ─── 8) Seed BudgetItems ─────────────────────────────────────────────────────────────────
    console.log('⏳ Creating budget items…');
    const budgetItemsData = [
      // For Project 1
      {
        id: 'b1b11111-1111-1111-1111-111111111111',
        projectId: 'f6f6f6f6-1111-1111-1111-111111111111',
        name: 'Consultant Fees',
        description: 'Environmental consultant engagement fees',
        category: 'Services',
        amount: 5000000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-01-23'),
        endDate: new Date('2023-04-23'),
        status: 'Active',
        priority: 'High',
        notes: 'Paid in three installments',
      },
      // For Project 2
      {
        id: 'b2b22222-2222-2222-2222-222222222222',
        projectId: 'f7f7f7f7-2222-2222-2222-222222222222',
        name: 'Laboratory Analysis',
        description: 'Baseline sample lab analysis',
        category: 'Laboratory',
        amount: 1200000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-03-23'),
        endDate: new Date('2023-04-23'),
        status: 'Active',
        priority: 'Medium',
        notes: 'Includes water & soil testing',
      },
      // For Project 3
      {
        id: 'b3b33333-3333-3333-3333-333333333333',
        projectId: 'f8f8f8f8-3333-3333-3333-333333333333',
        name: 'Field Survey',
        description: 'Field data collection & travel costs',
        category: 'Survey',
        amount: 800000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-01-23'),
        endDate: new Date('2023-02-23'),
        status: 'Active',
        priority: 'Medium',
        notes: 'Local travel and per diem',
      },
      // For Project 4
      {
        id: 'b4b44444-4444-4444-4444-444444444444',
        projectId: 'f9f9f9f9-4444-4444-4444-444444444444',
        name: 'Public Consultation',
        description: 'Community meetings and stakeholder consultation',
        category: 'Consultation',
        amount: 400000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-02-23'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'Low',
        notes: 'Includes venue rentals and refreshments',
      },
      // For Project 5
      {
        id: 'b5b55555-5555-5555-5555-555555555555',
        projectId: 'fafafafa-5555-5555-5555-555555555555',
        name: 'Geotechnical Testing',
        description: 'Soil testing and geotechnical reports',
        category: 'Testing',
        amount: 950000.0,
        usedAmount: 0.0,
        startDate: new Date('2022-12-22'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'High',
        notes: 'Third-party lab engagement',
      },
      // For Project 6
      {
        id: 'b6b66666-6666-6666-6666-666666666666',
        projectId: 'fbfbfbfb-6666-6666-6666-666666666666',
        name: 'Air Quality Monitoring',
        description: 'AQI sampling and real-time monitoring setup',
        category: 'Monitoring',
        amount: 700000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-01-23'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'Medium',
        notes: 'Includes equipment rental',
      },
      // For Project 7
      {
        id: 'b7b77777-7777-7777-7777-777777777777',
        projectId: 'fcfcfcfc-7777-7777-7777-777777777777',
        name: 'Compliance Audit',
        description: 'Third-party EMP compliance audit',
        category: 'Audit',
        amount: 500000.0,
        usedAmount: 0.0,
        startDate: new Date('2022-11-22'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'Low',
        notes: 'Includes travel to site',
      },
      // For Project 8
      {
        id: 'b8b88888-8888-8888-8888-888888888888',
        projectId: 'fdfdfdfd-8888-8888-8888-888888888888',
        name: 'Traffic Counters & Cameras',
        description: 'Installation of traffic counters and camera surveys',
        category: 'Equipment',
        amount: 350000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-03-23'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'High',
        notes: 'One-day installation and data collection',
      },
      // For Project 9
      {
        id: 'b9b99999-9999-9999-9999-999999999999',
        projectId: 'fefefefe-9999-9999-9999-999999999999',
        name: 'Fire Safety Assessment',
        description: 'Consultant fees for fire safety audit',
        category: 'Safety',
        amount: 650000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-02-23'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'Medium',
        notes: 'Report delivery in 4 weeks',
      },
      // For Project 10
      {
        id: 'babababa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        projectId: 'f0f0f0f0-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Traffic Simulation Model',
        description: 'Software license and model building',
        category: 'Software',
        amount: 450000.0,
        usedAmount: 0.0,
        startDate: new Date('2023-02-23'),
        endDate: new Date('2023-03-23'),
        status: 'Active',
        priority: 'High',
        notes: 'Includes staff training',
      },
      // For DUMMY 11
      {
        id: 'bbbbbdbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
        projectId: 'f1f1f1f1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Traffic Impact Pre-Study',
        description: 'Preliminary traffic counts and stakeholder interviews',
        category: 'Survey',
        amount: 250000.0,
        usedAmount: 0.0,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        status: 'Active',
        priority: 'Low',
        notes: 'One month of data collection',
      },
      // For DUMMY 12
      {
        id: 'cccccdcc-cccc-cccc-cccc-cccccccccc12',
        projectId: 'f2f2f2f2-cccc-cccc-cccc-cccccccccccc',
        name: 'Environmental Baseline Survey',
        description: 'Baseline flora, fauna, and soil sampling',
        category: 'Survey',
        amount: 300000.0,
        usedAmount: 0.0,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-05-30'),
        status: 'Active',
        priority: 'Medium',
        notes: 'One month fieldwork',
      },
    ];
    await BudgetItem.bulkCreate(budgetItemsData);
    console.log(`✅ ${budgetItemsData.length} budget items created.`);

    //
    // ─── 9) Seed Expenses ────────────────────────────────────────────────────────────────────
    console.log('⏳ Creating expenses…');
    const expensesData = [
      // For Project 1
      {
        id: 'fcfcfcfc-1111-1111-1111-111111111111',
        projectId: 'f6f6f6f6-1111-1111-1111-111111111111',
        budgetItemId: 'b1b11111-1111-1111-1111-111111111111',
        amount: 1500000.0,
        description: 'Deposit payment to consultant',
        date: new Date('2023-02-01'),
        category: 'Services',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      // For Project 2
      {
        id: 'fdfdfdfd-2222-2222-2222-222222222222',
        projectId: 'f7f7f7f7-2222-2222-2222-222222222222',
        budgetItemId: 'b2b22222-2222-2222-2222-222222222222',
        amount: 600000.0,
        description: 'First batch of lab samples',
        date: new Date('2023-03-25'),
        category: 'Laboratory',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      // For Project 3
      {
        id: 'fefefefe-3333-3333-3333-333333333333',
        projectId: 'f8f8f8f8-3333-3333-3333-333333333333',
        budgetItemId: 'b3b33333-3333-3333-3333-333333333333',
        amount: 300000.0,
        description: 'Field survey transport costs',
        date: new Date('2023-01-30'),
        category: 'Travel',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        createdBy: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      // For Project 4
      {
        id: 'fbfbfbfb-4444-4444-4444-444444444444',
        projectId: 'f9f9f9f9-4444-4444-4444-444444444444',
        budgetItemId: 'b4b44444-4444-4444-4444-444444444444',
        amount: 200000.0,
        description: 'Community outreach expenses',
        date: new Date('2023-02-25'),
        category: 'Consultation',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      // For Project 5
      {
        id: 'fcfcfcfc-5555-5555-5555-555555555555',
        projectId: 'fafafafa-5555-5555-5555-555555555555',
        budgetItemId: 'b5b55555-5555-5555-5555-555555555555',
        amount: 500000.0,
        description: 'Soil testing lab charges',
        date: new Date('2023-01-28'),
        category: 'Testing',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending',
        createdBy: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      // For Project 6
      {
        id: 'fdfdfdfd-6666-6666-6666-666666666666',
        projectId: 'fbfbfbfb-6666-6666-6666-666666666666',
        budgetItemId: 'b6b66666-6666-6666-6666-666666666666',
        amount: 350000.0,
        description: 'AQI sensor rental',
        date: new Date('2023-02-15'),
        category: 'Monitoring',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      // For Project 7
      {
        id: 'fefefefe-7777-7777-7777-777777777777',
        projectId: 'fcfcfcfc-7777-7777-7777-777777777777',
        budgetItemId: 'b7b77777-7777-7777-7777-777777777777',
        amount: 250000.0,
        description: 'Desk audit fees',
        date: new Date('2022-12-15'),
        category: 'Audit',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        createdBy: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      // For Project 8
      {
        id: 'f0f0f0f0-8888-8888-8888-888888888888',
        projectId: 'fdfdfdfd-8888-8888-8888-888888888888',
        budgetItemId: 'b8b88888-8888-8888-8888-888888888888',
        amount: 120000.0,
        description: 'Traffic counter daily hire',
        date: new Date('2023-03-22'),
        category: 'Equipment',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      // For Project 9
      {
        id: 'f1f1f1f1-9999-9999-9999-999999999999',
        projectId: 'fefefefe-9999-9999-9999-999999999999',
        budgetItemId: 'b9b99999-9999-9999-9999-999999999999',
        amount: 200000.0,
        description: 'Fire safety consultant visit',
        date: new Date('2023-02-20'),
        category: 'Safety',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        createdBy: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      // For Project 10
      {
        id: 'f2f2f2f2-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        projectId: 'f0f0f0f0-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        budgetItemId: 'babababa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        amount: 150000.0,
        description: 'Simulation software license',
        date: new Date('2023-02-22'),
        category: 'Software',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
      // For DUMMY 11
      {
        id: 'f3f3f3f3-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        projectId: 'f1f1f1f1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        budgetItemId: 'bbbbbdbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
        amount: 100000.0,
        description: 'Headline surveys',
        date: new Date('2024-01-20'),
        category: 'Survey',
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        createdBy: 'b2b2b2b2-2222-2222-2222-222222222222',
      },
      // For DUMMY 12
      {
        id: 'f4f4f4f4-cccc-cccc-cccc-cccccccccc12',
        projectId: 'f2f2f2f2-cccc-cccc-cccc-cccccccccccc',
        budgetItemId: 'cccccdcc-cccc-cccc-cccc-cccccccccc12',
        amount: 150000.0,
        description: 'Baseline sample processing',
        date: new Date('2024-05-10'),
        category: 'Survey',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Pending',
        createdBy: 'a1a1a1a1-1111-1111-1111-111111111111',
      },
    ];
    await Expense.bulkCreate(expensesData);
    console.log(`✅ ${expensesData.length} expenses created.`);

    //
    // ─── 10) Seed ProjectMembers ───────────────────────────────────────────────────────────────
    console.log('⏳ Creating project members…');
    const projectMembersData = [
      // Project 1
      {
        id: '11111111-1111-1111-1111-111111111111',
        projectId: 'f6f6f6f6-1111-1111-1111-111111111111',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Admin',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        projectId: 'f6f6f6f6-1111-1111-1111-111111111111',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Developer',
      },
      // Project 2
      {
        id: '33333333-3333-3333-3333-333333333333',
        projectId: 'f7f7f7f7-2222-2222-2222-222222222222',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Viewer',
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        projectId: 'f7f7f7f7-2222-2222-2222-222222222222',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Scrum Master',
      },
      // Project 3
      {
        id: '55555555-5555-5555-5555-555555555555',
        projectId: 'f8f8f8f8-3333-3333-3333-333333333333',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Product Owner',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        projectId: 'f8f8f8f8-3333-3333-3333-333333333333',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Developer',
      },
      // Project 4
      {
        id: '77777777-7777-7777-7777-777777777777',
        projectId: 'f9f9f9f9-4444-4444-4444-444444444444',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Scrum Master',
      },
      // Project 5
      {
        id: '88888888-8888-8888-8888-888888888888',
        projectId: 'fafafafa-5555-5555-5555-555555555555',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Developer',
      },
      // Project 6
      {
        id: '99999999-9999-9999-9999-999999999999',
        projectId: 'fbfbfbfb-6666-6666-6666-666666666666',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Product Owner',
      },
      // Project 7
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        projectId: 'fcfcfcfc-7777-7777-7777-777777777777',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Viewer',
      },
      // Project 8
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        projectId: 'fdfdfdfd-8888-8888-8888-888888888888',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Scrum Master',
      },
      // Project 9
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        projectId: 'fefefefe-9999-9999-9999-999999999999',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Developer',
      },
      // Project 10
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        projectId: 'f0f0f0f0-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Product Owner',
      },
      // DUMMY 11
      {
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        projectId: 'f1f1f1f1-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        userId: 'b2b2b2b2-2222-2222-2222-222222222222',
        role: 'Viewer',
      },
      // DUMMY 12
      {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        projectId: 'f2f2f2f2-cccc-cccc-cccc-cccccccccccc',
        userId: 'a1a1a1a1-1111-1111-1111-111111111111',
        role: 'Developer',
      },
    ];
    await ProjectMember.bulkCreate(projectMembersData);
    console.log('✅ Project members created.');

    console.log('>>> Calling seedProjectData from seed.js...');
    // Seed the detailed project with board, sprint, stories, tasks, epic
    await seedProjectData();
    console.log('<<< Returned from seedProjectData in seed.js.');

    console.log('🎉 Seed script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in seed script:', error);
    process.exit(1);
  }
})();
