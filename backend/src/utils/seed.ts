import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Customer } from "../models/Customer";
import { Vehicle } from "../models/Vehicle";
import { JobCard } from "../models/JobCard";
import { JobCardMessage } from "../models/JobCardMessage";
import { FollowUp } from "../models/FollowUp";
import { Feedback } from "../models/Feedback";
import { ServiceCategory } from "../models/ServiceCategory";
import { SLA } from "../models/SLA";
import { ActivityLog } from "../models/ActivityLog";
import { Notification } from "../models/Notification";

dotenv.config();

export const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vehicle_crm";
      await mongoose.connect(MONGO_URI);
    }
    console.log("[Seeder] Seeding database...");

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Vehicle.deleteMany({}),
      JobCard.deleteMany({}),
      JobCardMessage.deleteMany({}),
      FollowUp.deleteMany({}),
      Feedback.deleteMany({}),
      ServiceCategory.deleteMany({}),
      SLA.deleteMany({}),
      ActivityLog.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // 1. Seed Service Categories
    await ServiceCategory.insertMany([
      {
        name: "General Maintenance",
        description: "Routine inspections, fluid replacements, and periodic tune-ups.",
        subServices: ["Periodic 10,000km Service", "Engine Oil & Filter Change", "Multi-Point Safety Inspection", "Fluid Level Top-up"],
        estimatedHours: 2,
        status: "active"
      },
      {
        name: "Engine & Transmission",
        description: "Complete engine diagnosis, tuning, transmission repair, and overhaul.",
        subServices: ["Spark Plug Replacement", "Timing Belt / Chain Replacement", "Transmission Fluid Flush", "Engine Tuning & Scanning"],
        estimatedHours: 4,
        status: "active"
      },
      {
        name: "Brakes & Suspension",
        description: "Braking system repair, shock absorbers, and suspension calibration.",
        subServices: ["Front Brake Pads Replacement", "Rear Brake Shoes Replacement", "Disc Rotor Resurfacing", "Suspension Bushing & Shocks"],
        estimatedHours: 3,
        status: "active"
      },
      {
        name: "Electrical & Diagnostics",
        description: "OBD-II computer diagnostics, battery, alternator, and wiring.",
        subServices: ["ECU Diagnostic Scan", "Battery Health Check & Replacement", "Alternator Repair", "Sensor Calibration"],
        estimatedHours: 2,
        status: "active"
      },
      {
        name: "AC & Cooling System",
        description: "Air conditioning leak test, gas recharge, and radiator maintenance.",
        subServices: ["AC Gas Top-up & Leak Test", "Cabin AC Filter Replacement", "Radiator Flush & Coolant", "AC Compressor Overhaul"],
        estimatedHours: 3,
        status: "active"
      }
    ]);

    // 2. Seed SLAs
    await SLA.insertMany([
      { priority: "critical", serviceType: "all", responseTimeHours: 1, turnaroundTimeHours: 4, status: "active" },
      { priority: "high", serviceType: "all", responseTimeHours: 2, turnaroundTimeHours: 24, status: "active" },
      { priority: "medium", serviceType: "all", responseTimeHours: 8, turnaroundTimeHours: 48, status: "active" },
      { priority: "low", serviceType: "all", responseTimeHours: 24, turnaroundTimeHours: 72, status: "active" }
    ]);

    // 3. Seed Staff
    const admin = await User.create({
      name: "Tariq Mahmood (Manager)",
      email: "admin@workshop.com",
      phone: "+92 300 1112233",
      password: "password123",
      role: "admin",
      specialization: "Other",
      status: "active"
    });

    const tech1 = await User.create({
      name: "Ali Raza",
      email: "ali@workshop.com",
      phone: "+92 301 2223344",
      password: "password123",
      role: "technician",
      specialization: "Engine Repair",
      status: "active"
    });

    const tech2 = await User.create({
      name: "Ahmed Hassan",
      email: "ahmed@workshop.com",
      phone: "+92 302 3334455",
      password: "password123",
      role: "technician",
      specialization: "Electrical",
      status: "active"
    });

    const tech3 = await User.create({
      name: "Bilal Sheikh",
      email: "bilal@workshop.com",
      phone: "+92 303 4445566",
      password: "password123",
      role: "technician",
      specialization: "AC & Cooling",
      status: "active"
    });

    const tech4 = await User.create({
      name: "Rashid Minhas",
      email: "rashid@workshop.com",
      phone: "+92 304 5556677",
      password: "password123",
      role: "technician",
      specialization: "Suspension & Brakes",
      status: "active"
    });

    // 4. Seed Customers & Portal accounts
    const cust1 = await Customer.create({
      name: "Usman Khan",
      email: "usman@gmail.com",
      phone: "+92 321 9876543",
      city: "Lahore",
      address: "House 45, Sector Y, DHA Phase 3",
      tags: ["VIP", "Regular"],
      status: "active"
    });
    const userCust1 = await User.create({
      name: cust1.name,
      email: cust1.email,
      phone: cust1.phone,
      password: "password123",
      role: "customer",
      customerId: cust1._id,
      status: "active"
    });
    await Customer.findByIdAndUpdate(cust1._id, { userId: userCust1._id });

    const cust2 = await Customer.create({
      name: "Sara Ahmed",
      email: "sara@gmail.com",
      phone: "+92 333 8765432",
      city: "Karachi",
      address: "Apartment 7B, Clifton Block 5",
      tags: ["Regular"],
      status: "active"
    });
    const userCust2 = await User.create({
      name: cust2.name,
      email: cust2.email,
      phone: cust2.phone,
      password: "password123",
      role: "customer",
      customerId: cust2._id,
      status: "active"
    });
    await Customer.findByIdAndUpdate(cust2._id, { userId: userCust2._id });

    // 5. Seed Vehicles
    const v1 = await Vehicle.create({
      owner: cust1._id,
      make: "Toyota",
      model: "Corolla Altis Grande 1.8",
      year: 2021,
      registrationNumber: "LEA-21-9842",
      chassisNumber: "NZE161-9048214",
      fuelType: "Petrol",
      mileage: 42500,
      lastServiceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    });

    const v2 = await Vehicle.create({
      owner: cust1._id,
      make: "Honda",
      model: "Civic RS Turbo",
      year: 2022,
      registrationNumber: "ISB-22-1109",
      chassisNumber: "FC1-2094829",
      fuelType: "Petrol",
      mileage: 28000,
      lastServiceDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
    });

    const v3 = await Vehicle.create({
      owner: cust2._id,
      make: "Kia",
      model: "Sportage AWD",
      year: 2023,
      registrationNumber: "KHI-23-4501",
      chassisNumber: "KNA-9840291",
      fuelType: "Petrol",
      mileage: 18200,
      lastServiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    });

    // 6. Seed Job Cards
    const jc1 = await JobCard.create({
      jobCardNumber: "JC-2026-0001",
      customer: cust1._id,
      vehicle: v1._id,
      subject: "Engine knocking noise on acceleration & oil service",
      description: "Customer reports unusual rattling sound near engine block when accelerating past 3000 RPM.",
      serviceType: "Engine & Transmission",
      subService: "Engine Tuning & Scanning",
      priority: "high",
      status: "in_progress",
      assignedTo: tech1._id,
      createdBy: admin._id,
      source: "walk_in",
      slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
      firstResponseAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      diagnosisNotes: "OBD-II scan showed misfire on Cylinder 2. Spark plugs worn out. Engine oil viscosity degraded.",
      partsUsed: [
        { name: "Synthetic Motor Oil 5W-30 (4L)", partNumber: "OIL-5W30-SYN", quantity: 1, unitPrice: 45, total: 45 },
        { name: "Genuine Oil Filter", partNumber: "FILT-TY-01", quantity: 1, unitPrice: 15, total: 15 },
        { name: "Iridium Spark Plugs (Set of 4)", partNumber: "SPK-IR-04", quantity: 1, unitPrice: 60, total: 60 }
      ],
      laborCharges: 50,
      totalCost: 170,
      customerApprovalStatus: "approved"
    });

    const jc2 = await JobCard.create({
      jobCardNumber: "JC-2026-0002",
      customer: cust2._id,
      vehicle: v3._id,
      subject: "AC blowing warm air & check engine light on",
      description: "Air conditioner is not cooling properly in traffic.",
      serviceType: "AC & Cooling System",
      subService: "AC Gas Top-up & Leak Test",
      priority: "medium",
      status: "completed",
      assignedTo: tech3._id,
      createdBy: userCust2._id,
      source: "website",
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      firstResponseAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      diagnosisNotes: "AC gas pressure low due to valve leak.",
      resolutionNotes: "Replaced AC valve seal, vacuum tested system, recharged R134a refrigerant.",
      partsUsed: [
        { name: "R134a Refrigerant Gas Recharge", partNumber: "GAS-R134A", quantity: 1, unitPrice: 35, total: 35 },
        { name: "Cabin AC Filter", partNumber: "CAB-FILT-KIA", quantity: 1, unitPrice: 20, total: 20 }
      ],
      laborCharges: 40,
      totalCost: 95,
      customerApprovalStatus: "approved"
    });

    const jc3 = await JobCard.create({
      jobCardNumber: "JC-2026-0003",
      customer: cust1._id,
      vehicle: v2._id,
      subject: "Front brake grinding & 25,000km periodic maintenance",
      description: "Severe vibration and metal grinding feel on heavy braking.",
      serviceType: "Brakes & Suspension",
      subService: "Front Brake Pads Replacement",
      priority: "high",
      status: "delivered",
      assignedTo: tech4._id,
      createdBy: admin._id,
      source: "phone_call",
      slaDeadline: new Date(Date.now() - 10 * 60 * 60 * 1000),
      firstResponseAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      resolutionNotes: "Installed ceramic brake pads, resurfaced front rotors, bled brake lines.",
      partsUsed: [
        { name: "Ceramic Front Brake Pads", partNumber: "BRK-CER-HN", quantity: 1, unitPrice: 75, total: 75 }
      ],
      laborCharges: 45,
      totalCost: 120,
      customerApprovalStatus: "approved"
    });

    // 7. Seed Messages
    await JobCardMessage.insertMany([
      {
        jobCard: jc1._id,
        sender: tech1._id,
        senderRole: "technician",
        type: "internal_note",
        message: "Compression test passed across all 4 cylinders."
      },
      {
        jobCard: jc1._id,
        sender: tech1._id,
        senderRole: "technician",
        type: "customer_reply",
        message: "Hello Mr. Usman, we diagnosed the knocking sound to worn spark plugs. Please review quotation."
      },
      {
        jobCard: jc1._id,
        sender: userCust1._id,
        senderRole: "customer",
        type: "customer_reply",
        message: "Quotation approved. Please proceed with genuine parts."
      }
    ]);

    // 8. Seed Follow-ups
    await FollowUp.create({
      jobCard: jc1._id,
      assignedTo: tech1._id,
      date: new Date(),
      time: "02:30 PM",
      type: "phone_call",
      status: "pending",
      notes: "Call customer after test drive to confirm satisfaction and pickup time.",
      nextAction: "Vehicle handover preparation",
      createdBy: admin._id
    });

    // 9. Seed Feedback
    await Feedback.create({
      jobCard: jc3._id,
      customer: cust1._id,
      technician: tech4._id,
      rating: 5,
      comment: "Excellent service! Rashid fixed the brake vibration completely and delivered car on time.",
      satisfactionStatus: "satisfied"
    });

    // 10. Seed Activity Log
    await ActivityLog.create({
      user: admin._id,
      jobCard: jc1._id,
      action: "JOB_CARD_CREATED",
      newValue: "open",
      description: "Job card JC-2026-0001 created by Manager Tariq"
    });

    // 11. Seed Notification
    await Notification.create({
      recipient: admin._id,
      type: "critical_job",
      title: "Welcome to Auto Workshop CRM",
      message: "System initialized and ready for workshop operations.",
      read: false
    });

    console.log("[Seeder] Seeding finished successfully!");
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error("[Seeder Error]:", error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase(true);
}