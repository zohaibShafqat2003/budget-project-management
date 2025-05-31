// seed.js
require('dotenv').config();
const { sequelize, Project, Client, BudgetItem, Expense, User } = require('../models');

// Wrap everything in an async iife so we can await as we go
(async () => {
  try {
    console.log('🔄 Starting seed script…');

    // 1) In development, force‐sync the schema (drop & recreate). Remove `force:true` in production!
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synchronized (force: true)');

    // 2) Seed Clients first (so Project.clientId can reference them)
    //    We assume a minimal Client model: { id, name, contactEmail, country, city, ... }.
    //    If your Client model has different fields, adjust accordingly.

    console.log('⏳ Creating clients…');
    const clientsData = [
      {
        id: '11c11111-1111-1111-1111-111111111111',
        name: 'IDAP',
        contactEmail: 'contact@idap.org',
        country: 'Pakistan',
        city: 'Rajanpur',
        industry: 'Healthcare',
        notes: 'Client for Mother & Child Hospital EIA',
      },
      {
        id: '12c22222-2222-2222-2222-222222222222',
        name: 'Pakistan Public Works Department',
        contactEmail: 'info@ppwd.gov.pk',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Government',
        notes: 'Client for ECP EIA',
      },
      {
        id: '13c33333-3333-3333-3333-333333333333',
        name: 'Mr. Umar Shareef',
        contactEmail: 'umar.shareef@example.com',
        country: 'Pakistan',
        city: 'Janjora, Kotli, AJK',
        industry: 'Mining',
        notes: 'Dolomite Exploration Client',
      },
      {
        id: '14c44444-4444-4444-4444-444444444444',
        name: 'Brothers Construction Pvt. Ltd',
        contactEmail: 'brothers@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Construction',
        notes: 'Solid Waste Management & Compliance Reports',
      },
      {
        id: '15c55555-5555-5555-5555-555555555555',
        name: 'M/s MGC Real Estate Builders and Developers Pvt Ltd',
        contactEmail: 'mgc@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Real Estate',
        notes: 'Client for Zaraj Housing Scheme IEE',
      },
      {
        id: '16c66666-6666-6666-6666-666666666666',
        name: 'M/s FG Investments',
        contactEmail: 'fg@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Investments',
        notes: 'Client for The Garden Residence EIA',
      },
      {
        id: '17c77777-7777-7777-7777-777777777777',
        name: 'Brothers Construction Pvt. Ltd',
        contactEmail: 'brothers@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Construction',
        notes: 'Client for Al Makkah City Compliance Report',
      },
      {
        id: '18c88888-8888-8888-8888-888888888888',
        name: 'Rawalpindi Chamber of Commerce & Industry',
        contactEmail: 'rcci@example.com',
        country: 'Pakistan',
        city: 'Rawalpindi',
        industry: 'Commerce',
        notes: 'Client for Women Entrepreneurs Display Centre TIA',
      },
      {
        id: '19c99999-9999-9999-9999-999999999999',
        name: 'M/s A&H Developers',
        contactEmail: 'ah@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Development',
        notes: 'Client for Mall of B-17 IEE',
      },
      {
        id: '19caaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Mr. Arbaz Khan',
        contactEmail: 'arbaz.khan@example.com',
        country: 'Pakistan',
        city: 'Islamabad',
        industry: 'Consultancy',
        notes: 'Client for Magnolia Mall TIA',
      },
    ];

    // Bulk‐create clients. Using the explicit IDs above ensures referential integrity.
    await Client.bulkCreate(clientsData);
    console.log('✅ Clients created.');

    // 3) Seed Projects (per your spreadsheet). We map each row to the Project model fields.
    console.log('⏳ Creating projects…');
    const projectsData = [
      {
        // Project 1: EIA of 200 Bedded Mother and Child Hospital
        id: 'e1a1a111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        projectIdStr: 'EIA-001',
        name: 'EIA of 200 Bedded Mother and Child Hospital',
        duration: '1',
        startDate: new Date('2023-01-23'),
        completionDate: new Date('2023-04-23'),
        approxValueOfServices: 1.6,
        narrativeDescription:
          'The Mother & Child Care Hospital in Rajanpur will comprise a bed strength of 200 beds. ' +
          'The approximate covered area of the hospital building is 410,206.64 sq. ft. ' +
          'This project is targeted to the public, to boost their confidence in the primary health care system. ' +
          'This will also enable them to obtain the requisite medical treatment to enable them to live a healthy life ' +
          'and can play a positive role in the progress of the country. The addition of this facility in these areas ' +
          'would provide health services to the desired level, easing the burden due to large patient influx, scarcity ' +
          'of resources, human resource deficiency, and non-functional equipment. Additionally, it will also provide ' +
          'services to the adjacent districts and tribal areas as currently there is no mother & child hospital in the region.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed of all major and minor impacts ' +
          'during Pre-Construction, Construction and Operational phase of the Project; Proposed mitigation measures to minimize, ' +
          'eliminate or to compensate the potential adverse impacts identified; Assessed the compliance of the mitigation measures ' +
          'given in the EIA; Prepared Environmental Compliance Monitoring Report of the project.',
        clientId: '11c11111-1111-1111-1111-111111111111', // IDAP
        country: 'Pakistan',
        city: 'Rajanpur',
        nameOfClient: 'IDAP',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Research Associate to Individual Consultant); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer/Individual Consultant); ' +
          'Ms. Ayesha Hanif (Environmental Scientist/Research Associate to Individual Consultant)',
      },
      {
        // Project 2: EIA of Election Commission of Pakistan (ECP) Project
        id: 'e2b2b222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        projectIdStr: 'ECP-002',
        name: 'EIA of Election Commission of Pakistan (ECP) Project, Sector H-11/4, Islamabad',
        duration: '1.0 months',
        startDate: new Date('2023-03-23'),
        completionDate: new Date('2023-04-23'),
        approxValueOfServices: 0.65,
        narrativeDescription:
          'Election Commission of Pakistan is responsible to conduct free, fair and impartial elections in the country. ' +
          'Currently, Election Commission of Pakistan has a stop gap arrangement on rooftop of ECP complex to run Federal Election ' +
          'Academy where election officers are trained, and other national and international events are hosted. However, same is not ' +
          'fulfilling the requirements owing to shortage of space. Accordingly, Election Commission of Pakistan acquired a plot from ' +
          'Capital Development Authority at H-11/4, Islamabad to cater for the needs of the time. For the purpose, Election Commission of ' +
          'Pakistan approached Capital Development Authority (CDA) for allotment of the land to the authority for construction of Federal ' +
          'Election Commission Academy and other offices of election commission of Pakistan, which was approved, and a piece of land measuring ' +
          '5000 sq. yd was allotted to ECP in Sector H-11/4, Islamabad by the end of year 2019.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during ' +
          'Pre-Construction, Construction and Operational phase of the Project; Proposed mitigation measures to minimize, eliminate or to ' +
          'compensate the potential adverse impacts identified; Assessed the compliance of the mitigation measures given in the EIA; ' +
          'Prepared Environmental Compliance Monitoring Report of the project.',
        clientId: '12c22222-2222-2222-2222-222222222222', // PPPWD
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Pakistan Public Works Department',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer); ' +
          'Ms. Ayesha Hanif (Environmental Scientist)',
      },
      {
        // Project 3: Initial Environmental Examination Majmooha Zamzam Dolomite
        id: 'e3c3c333-2222-3333-4444-555566667777',
        projectIdStr: 'IEE-003',
        name: 'Initial Environmental Examination of Majmooha Zamzam Dolomite Exploration, Extraction and Processing Unit, Janjora, Kotli AJK',
        duration: '1',
        startDate: new Date('2023-01-23'),
        completionDate: new Date('2023-02-23'),
        approxValueOfServices: 0.0,
        narrativeDescription:
          'The purpose of the project is to provide dolomite aggregate to the construction industry of district Kotli to meet their needs at an affordable price.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Identified and assessed all major and minor impacts during Pre-construction, Construction and Operation phases of the Project; ' +
          'Identified all significant impacts that may require detailed assessment; Proposed mitigation measures to minimize, eliminate or to ' +
          'compensate the potential adverse impacts identified; Prepared Environmental Mitigation and Monitoring Plan; Prepared Plantation Plan; ' +
          'Prepared Initial Environmental Examination Report of the project.',
        clientId: '13c33333-3333-3333-3333-333333333333', // Mr. Umar Shareef
        country: 'Pakistan',
        city: 'Janjora, Kotli, AJK',
        nameOfClient: 'Mr. Umar Shareef',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Mr. Ali Abdullah (Enviro-Civil Engineer)',
      },
      {
        // Project 4: Solid Waste Management Plan of Al Makkah City Project
        id: 'e4d4d444-4444-5555-6666-777788889999',
        projectIdStr: 'SWM-004',
        name: 'Solid Waste Management Plan of Al Makkah City Project, Zone V, Islamabad',
        duration: '1',
        startDate: new Date('2023-02-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.3,
        narrativeDescription:
          'M/s Brothers Construction Pvt Ltd intends to develop a modern housing society on Mehfooz Shaheed Road. The aim of the project is to provide an affordable housing society in a sustainable manner. The implementation of the solid waste management plan will reduce the impacts on the environment.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during Construction and Operational phase of the Project; ' +
          'Proposed mitigation measures to minimize, eliminate or to compensate the potential adverse impacts identified; Prepared Environmental Mitigation and Monitoring Plan; Prepared Plantation Plan; ' +
          'Prepared Initial Environmental Examination Report of the project.',
        clientId: '14c44444-4444-4444-4444-444444444444', // Brothers Construction
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Brothers Construction Pvt. Ltd',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer)',
      },
      {
        // Project 5: IEE of Rania Heights, Zaraj Housing Scheme, Islamabad
        id: 'e5e5e555-5555-6666-7777-88889999aaaa',
        projectIdStr: 'IEE-005',
        name: 'IEE of Rania Heights, Zaraj Housing Scheme, Islamabad',
        duration: '1',
        startDate: new Date('2022-12-22'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 1.2,
        narrativeDescription:
          'M/s MGC Real Estate Builders intends to regularize a high-rise residential apartment building in the Sector A of Zaraj Housing Scheme, Islamabad. The project will help to reduce the shortage of available housing units and will help to meet the rising demand of housing in Islamabad. The project is a vertical housing project which will provide high-quality living space to people without having to clear and degrade large areas of land. The project consists of building 3 high-rise apartment buildings, each block will be 8 stories high which will be built on a plot of land measuring 22 kanals. The project will comprise of a total of 358 apartments, 133 in Block A, 130 in Block B and 94 in Block C.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during Pre-Construction, Construction and Operational phase of the Project; ' +
          'Proposed mitigation measures to minimize, eliminate or to compensate the potential adverse impacts identified; Assessed the compliance of the mitigation measures given in the EIA; ' +
          'Prepared Environmental Compliance Monitoring Report of the project.',
        clientId: '15c55555-5555-5555-5555-555555555555', // M/s MGC Real Estate
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'M/s MGC Real Estate Builders and Developers Pvt Ltd',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer); ' +
          'Engr. Amna Saeed (Environmental Engineer)',
      },
      {
        // Project 6: EIA of The Garden Residence Project, Islamabad
        id: 'e6f6f666-6666-7777-8888-99990000bbbb',
        projectIdStr: 'EIA-006',
        name: 'EIA of The Garden Residence Project, Islamabad',
        duration: '1',
        startDate: new Date('2023-01-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.8,
        narrativeDescription:
          'M/s FG Investments intends to construct a high-rise residential apartment building in the heart of Islamabad in F-10 Markaz. The project will help to reduce the shortage of available housing units and will help to meet the rising demand of housing in Islamabad. The project is a vertical housing project which will provide high-quality living space to people without having to clear and degrade large areas of land. The project consists of building 2 high-rise apartment buildings, Tower A/B consisting of 26 Floors and Tower C consisting of 41 floors. There will be a total of 326 housing units in the project which will provide accommodation to approximately 1,956 people.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during Pre-Construction, Construction and Operational phase of the Project; ' +
          'Proposed mitigation measures to minimize, eliminate or to compensate the potential adverse impacts identified; Assessed the compliance of the mitigation measures given in the EIA; ' +
          'Prepared Environmental Compliance Monitoring Report of the project.',
        clientId: '16c66666-6666-6666-6666-666666666666', // M/s FG Investments
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'M/s FG Investments',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer); ' +
          'Ms. Ayesha Hanif (Environmental Scientist)',
      },
      {
        // Project 7: Project Compliance Report of Al Makkah City Project, Islamabad
        id: 'e7g7g777-7777-8888-9999-aaaabbbbcccc',
        projectIdStr: 'PCR-007',
        name: 'Project Compliance Report of Al Makkah City Project, Islamabad',
        duration: '5',
        startDate: new Date('2022-11-22'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.15,
        narrativeDescription:
          'M/s Brothers Construction Pvt Ltd intends to develop a modern housing society on Mehfooz Shaheed Road. The aim of the project is to provide an affordable housing society in a sustainable manner. The report analyzes the sustainability of the project and provides detailed information on the mitigation measures implemented as a part of the project which were suggested in the EIA.',
        actualServicesDescription:
          'The services included: Tabulated the compliance of conditions stated in EMP and Environmental Approval.',
        clientId: '17c77777-7777-7777-7777-777777777777', // Brothers Construction
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Brothers Construction Pvt. Ltd',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer)',
      },
      {
        // Project 8: TIA of Display Centre for Women Entrepreneurs/SMEs
        id: 'e8h8h888-8888-9999-aaaa-bbbbccccdddd',
        projectIdStr: 'TIA-008',
        name: 'TIA of Display Centre for Women Entrepreneurs/SMEs of the Rawalpindi Chamber of Commerce & Industry',
        duration: '1',
        startDate: new Date('2023-03-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.5,
        narrativeDescription:
          'The Display Centre for Women Entrepreneurs/SMEs Project is situated at plot no. 39/A, 39/B & 1B Civil Line, Rashid Minhas Road, Rawalpindi, and its main access is through Rashid Minhas Road and Jhanda Road. The TIA was conducted to assess the impact of the project on traffic flow on Rashid Minhas Road, to make sure that the additional influx of traffic from the project will be manageable. Compliance with all relevant national and international guidelines was ensured. The annual increase in traffic was assumed as 10% and the TIA found that the traffic will remain manageable.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during Pre-Construction, Construction and Operational phase of the Project; ' +
          'Proposed mitigation measures to minimize, eliminate or to compensate the potential adverse impacts identified; Assessed the traffic flow and influx; Prepared the traffic impact assessment report of the project.',
        clientId: '18c88888-8888-8888-8888-888888888888', // RCCI
        country: 'Pakistan',
        city: 'Rawalpindi',
        nameOfClient: 'Rawalpindi Chamber of Commerce & Industry',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer); ' +
          'Ms. Ayesha Hanif (Environmental Scientist)',
      },
      {
        // Project 9: IEE of Mall of B-17 Project
        id: 'e9i9i999-9999-aaaa-bbbb-ccccdddd1111',
        projectIdStr: 'IEE-009',
        name: 'IEE of Mall of B-17 Project, Sector B-17, Islamabad',
        duration: '1',
        startDate: new Date('2023-02-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.8,
        narrativeDescription:
          'M/s A&H Developers intend to develop a mall to facilitate the population of Sector B-17, Islamabad with a state-of-the-art commercial area with all facilities under one roof. The mall will be constructed on a plot measuring 107,640 square feet in Sector B-17 and will be 4 stories high. The mall will also include a parking space of total 415 cars and 218 bikes in its 2 basements. The total project cost is 995 million and it will be completed in 4 years.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during Pre-Construction, Construction and Operational phase of the Project; ' +
          'Proposed mitigation measures to minimize, eliminate or to compensate the potential adverse impacts identified; Assessed the compliance of the mitigation measures given in the IEE; ' +
          'Prepared Environmental Compliance Monitoring Report of the project.',
        clientId: '19c99999-9999-9999-9999-999999999999', // A&H Developers
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'M/s A&H Developers',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer); ' +
          'Engr. Amna Saeed (Environmental Engineer)',
      },
      {
        // Project 10: TIA of Magnolia Mall and Residence Project, GT Road
        id: 'e10j1010-aaaa-bbbb-cccc-ddddeeeeffff',
        projectIdStr: 'TIA-010',
        name: 'TIA of Magnolia Mall and Residence Project, GT Road, Mouza Jhangi Syedan, Islamabad',
        duration: '1',
        startDate: new Date('2023-02-23'),
        completionDate: new Date('2023-03-23'),
        approxValueOfServices: 0.3,
        narrativeDescription:
          'The Magnolia Mall & Residence Project is situated at GT Road, Mouza Jhangi Syedan, Islamabad on a plot area of 11 Kanals and 5 Marlas. The project site is accessible through GT Road. The TIA was conducted to assess the impact of the project on traffic flow on GT Road, to make sure that the additional influx of traffic from the project will be manageable. Compliance with all relevant national and international guidelines was ensured. The annual increase in traffic was assumed as 10% and the TIA found that the traffic will remain manageable.',
        actualServicesDescription:
          'The services included: Collected Baseline (Physical, Biological and Socio-economic) of the project area; ' +
          'Conducted consultation with the community in the project area; Identified and assessed all major and minor impacts during Pre-Construction, Construction and Operational phase of the Project; ' +
          'Proposed mitigation measures to minimize, eliminate or to compensate the potential adverse impacts identified; Assessed the traffic flow and influx; ' +
          'Prepared the traffic impact assessment report of the project.',
        clientId: '19caaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Mr. Arbaz Khan
        country: 'Pakistan',
        city: 'Islamabad',
        nameOfClient: 'Mr. Arbaz Khan',
        teamMembers:
          'Engr. Saadat Ali (Environmental Engineer/Team Leader); ' +
          'Engr. Ali Abdullah (Enviro-Civil Engineer); ' +
          'Engr. Azam Ali (Transport Engineer)',
      },

      //
      // ─── Additional Dummy Projects (for demonstration) ────────────────────────────────────────────────
      {
        id: 'd11d1111-dddd-dddd-dddd-dddddddddddd',
        projectIdStr: 'DUMMY-011',
        name: 'Dummy Infrastructure Upgrade Project',
        duration: '3',
        startDate: new Date('2024-01-15'),
        completionDate: new Date('2024-04-15'),
        approxValueOfServices: 2.5,
        narrativeDescription:
          'This is a dummy entry for an infrastructure upgrade project to demonstrate seed data. It involves road widening and drainage improvements.',
        actualServicesDescription:
          'The services included: Baseline survey, environmental assessment, stakeholder consultation, mitigation planning, compliance monitoring.',
        clientId: '11c11111-1111-1111-1111-111111111111',
        country: 'Pakistan',
        city: 'Lahore',
        nameOfClient: 'IDAP',
        teamMembers: 'Engr. Saadat Ali; Ms. Ayesha Hanif; Engr. Ali Abdullah',
      },
      {
        id: 'd12d2222-eeee-eeee-eeee-eeeeeeeeeeee',
        projectIdStr: 'DUMMY-012',
        name: 'Dummy Renewable Energy Feasibility Study',
        duration: '2',
        startDate: new Date('2024-05-01'),
        completionDate: new Date('2024-07-01'),
        approxValueOfServices: 1.1,
        narrativeDescription:
          'Feasibility study of a 50 MW solar PV plant in southern Pakistan, including land use, grid connection assessment, and environmental impacts.',
        actualServicesDescription:
          'The services included: Site inspection, baseline data collection, solar irradiance analysis, stakeholder consultation, mitigation plan, final feasibility report.',
        clientId: '12c22222-2222-2222-2222-222222222222',
        country: 'Pakistan',
        city: 'Karachi',
        nameOfClient: 'Pakistan Public Works Department',
        teamMembers:
          'Engr. Ali Abdullah; Dr. Ayesha Hanif (Environmental Scientist); Engr. Saadat Ali',
      },
      {
        id: 'd13d3333-ffff-ffff-ffff-ffffffffffff',
        projectIdStr: 'DUMMY-013',
        name: 'Dummy Municipal Solid Waste Audit',
        duration: '1',
        startDate: new Date('2024-08-01'),
        completionDate: new Date('2024-09-01'),
        approxValueOfServices: 0.4,
        narrativeDescription:
          'An audit of municipal solid waste management in a mid‐sized city, focusing on composition, generation rates, and disposal methods.',
        actualServicesDescription:
          'The services included: Waste characterization surveys, data analysis, stakeholder workshops, draft audit report, final recommendations.',
        clientId: '14c44444-4444-4444-4444-444444444444',
        country: 'Pakistan',
        city: 'Peshawar',
        nameOfClient: 'Brothers Construction Pvt. Ltd',
        teamMembers:
          'Engr. Ali Abdullah; Ms. Ayesha Hanif; Mr. Umar Shareef (consultant)',
      },
    ];

    // Bulk‐create all projects
    await Project.bulkCreate(projectsData);
    console.log(`✅ ${projectsData.length} projects created.`);

    // 4) (Optional) Seed BudgetItems for each project
    //    For demonstration, we'll create a couple of dummy budget items for the first 3 projects.
    console.log('⏳ Creating budget items…');
    const budgetItemsData = [
      {
        id: 'b1b11111-1111-1111-1111-111111111111',
        projectId: 'e1a1a111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
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
      {
        id: 'b2b22222-2222-2222-2222-222222222222',
        projectId: 'e2b2b222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
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
      {
        id: 'b3b33333-3333-3333-3333-333333333333',
        projectId: 'e3c3c333-2222-3333-4444-555566667777',
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
      // …you can add more budget items per project as needed…
    ];
    await BudgetItem.bulkCreate(budgetItemsData);
    console.log(`✅ ${budgetItemsData.length} budget items created.`);

    // 5) (Optional) Seed Expenses for demonstration
    console.log('⏳ Creating expenses…');
    const expensesData = [
      {
        id: 'x1x11111-1111-1111-1111-111111111111',
        projectId: 'e1a1a111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        budgetItemId: 'b1b11111-1111-1111-1111-111111111111',
        amount: 1500000.0,
        description: 'Deposit payment to consultant',
        date: new Date('2023-02-01'),
        category: 'Services',
        paymentMethod: 'Bank Transfer',
        paymentStatus: 'Approved',
      },
      {
        id: 'x2x22222-2222-2222-2222-222222222222',
        projectId: 'e2b2b222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        budgetItemId: 'b2b22222-2222-2222-2222-222222222222',
        amount: 600000.0,
        description: 'First batch of lab samples',
        date: new Date('2023-03-25'),
        category: 'Laboratory',
        paymentMethod: 'Credit Card',
        paymentStatus: 'Pending',
      },
      {
        id: 'x3x33333-3333-3333-3333-333333333333',
        projectId: 'e3c3c333-2222-3333-4444-555566667777',
        budgetItemId: 'b3b33333-3333-3333-3333-333333333333',
        amount: 300000.0,
        description: 'Field survey transport costs',
        date: new Date('2023-01-30'),
        category: 'Travel',
        paymentMethod: 'Cash',
        paymentStatus: 'Approved',
      },
      // …optional: more expenses …
    ];
    await Expense.bulkCreate(expensesData);
    console.log(`✅ ${expensesData.length} expenses created.`);

    // 6) (Optional) Create a couple of dummy Users so Project.ownerId or ProjectMember references work
    console.log('⏳ Creating dummy users…');
    const usersData = [
      {
        id: 'u1u11111-1111-1111-1111-111111111111',
        firstName: 'Alice',
        lastName: 'Admin',
        email: 'alice.admin@example.com',
        password: 'Admin123!', // will be hashed by the hook
        role: 'Admin',
      },
      {
        id: 'u2u22222-2222-2222-2222-222222222222',
        firstName: 'Bob',
        lastName: 'Developer',
        email: 'bob.dev@example.com',
        password: 'Dev123!',
        role: 'Developer',
      },
      // …add more test users as you like…
    ];
    await User.bulkCreate(usersData);
    console.log(`✅ ${usersData.length} dummy users created.`);

    // 7) (Optional) Seed ProjectMember (assign Alice & Bob to first project)
    console.log('⏳ Creating project members…');
    await sequelize.models.ProjectMember.bulkCreate([
      {
        id: 'pm1m1111-1111-1111-1111-111111111111',
        projectId: 'e1a1a111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        userId: 'u1u11111-1111-1111-1111-111111111111',
        role: 'Admin',
      },
      {
        id: 'pm2m2222-2222-2222-2222-222222222222',
        projectId: 'e1a1a111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        userId: 'u2u22222-2222-2222-2222-222222222222',
        role: 'Developer',
      },
    ]);
    console.log('✅ Project members created.');

    console.log('🎉 Seed script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in seed script:', error);
    process.exit(1);
  }
})();
