// Libs
var request = require('request');
var cheerio = require('cheerio');
var Crawler = require("crawler");
// Connect Db
var strConnection = 'mongodb://127.0.0.1:27017/jobs';
var Epl = require('./models/Employer');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(strConnection);
// Function create file if not exist
var defaultDir = './json-files/';
var files = [
    'link-employers-will-get-jobs.json',
    'link-jobs-will-crawl.json',
    'arrayEplInserted.json',
    'existed-employers-in-SJB.json',
    'array-jobs-will-add-to-SmartJobBoard.json',
    'existed-jobs-in-SJB.json',
    'trackingJobsInserted.json'
];

// JSON files path
var fileLinksEmployers = defaultDir + 'link-employers-will-get-jobs.json';
var fileJobsList = defaultDir + 'link-jobs-will-crawl.json';
// Smart job board API key
var apiKey = 'f59b583aa1b4ada293a40f17c10adabc';
var originPath = 'https://health.mysmartjobboard.com/api/';
//
var arrInsertedEpl = [];
var countInsertedJob = 0;

// Functions linh tinh ********************************************************

function randomEmail() {
    var text = "";
    var alphabet = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,r,s,t,u,v,w,x,y,z".split(",");
    var wordCount = 1;
    for (var i = 0; i < wordCount; i++) {
        var rand = null;
        for (var x = 0; x < 36; x++) {
            rand = Math.floor(Math.random() * alphabet.length);
            text += alphabet[rand];
        }
    }
    return text + '@gmail.com';
}

function extractFileName(fileUrl) {
    var arrFn = fileUrl.split('/');
    var ext = (arrFn[arrFn.length - 1].split('.'))[1];
    var filePathWithName = arrFn[arrFn.length - 2];
    filePathWithName = filePathWithName + '.' + ext;
    return filePathWithName;
}

function dataCleaned(job) {
    // match job type
    var arrJobType = ['Full Time', 'Part Time', 'Contractor', 'Intern', 'Seasonal', 'Volunteer', 'Internship'];
    var jobType = job.type;
    var strJobTypes = '';
    if (jobType) {
        for (var i = 0; i < arrJobType.length; i++) {
            var jt = arrJobType[i];
            if (jobType.indexOf(jt) > -1) {
                strJobTypes = jt;
            }
        }
    }

    job.type = strJobTypes;
    // match category
    var cats = job.specialty;
    var catsConverted = [];
    var arrCatAvailable = [
        {
            key: 'Academics / Research Jobs',
            value: [
                'Academics / Research',
                'Allergy, Asthma & Immunology',
                'Anesthesiology',
                'Cardiology',
                'Dermatology',
                'Emergency Medicine',
                'Endocrinology',
                'Epidemiology',
                'Family Medicine',
                'Gastroenterology',
                'Gastroenterology - DDW',
                'Geriatric Medicine',
                'Hematology / Oncology',
                'Hospitalist',
                'Infectious Disease / HIV Medicine',
                'Internal Medicine',
                'Medical Genetics',
                'Nephrology',
                'Neurological Surgery',
                'Neurology',
                'OBGYN',
                'Occupational / Environmental Medicine',
                'Ophthalmology',
                'Oral & Maxillofacial Surgery',
                'Orthopaedics',
                'Otolaryngology',
                'Palliative Medicine',
                'Pathology',
                'Pediatrics',
                'Physical Medicine & Rehabilitation',
                'Psychiatry',
                'Pulmonary/Critical Care',
                'Rheumatology',
                'Surgery',
                'Urology',
                'Vascular Surgery',
                'Biotechnology / Research',
                'Research Coordinator',
                'Research Director',
                'Toxicologist',
            ]
        },
        {
            key: "Therapy Jobs",
            value: [
                'Occupational / Physical Therapy',
                'Rehabilitation / Therapy',
                'Respiratory Therapy',
                'Speech / Language'
            ]
        },
        {
            key: "Radiologic Technologist / Medical Imaging Jobs",
            value: [
                'Bone Densitometry',
                'Cardiovascular Interventional',
                'Computed Tomography (CT)',
                'Diagnostic Imaging Assistant',
                'Echocardiography',
                'Magnetic Resonance (MR or MRI)',
                'Mammography',
                'Management / Education',
                'Medical Dosimetry',
                'Medical Physicist',
                'Nuclear Medicine',
                'Quality Assurance - Radiology / Medical Imaging',
                'Radiation Therapy',
                'Radiography',
                'Sonography',
                'Vascular Sonography',
                'X-Ray Machine Operator - Limited'
            ]
        },
        {
            key: "Physician and Surgeon Jobs",
            value: [
                "Allergy, Asthma & Immunology",
                "Anesthesiology",
                "Cardiology",
                "Dermatology",
                "Emergency Medicine",
                "Endocrinology",
                "Family Medicine",
                "Gastroenterology",
                "Geriatric Medicine",
                "Hematology / Oncology",
                "Hospital Medicine",
                "Infectious Disease / HIV Medicine",
                "Internal Medicine",
                "Locum Tenens",
                "Medical Genetics",
                "Med-Peds",
                "Neonatology",
                "Nephrology",
                "Neurological Surgery",
                "Neurology",
                "Occupational / Environmental Medicine",
                "Ophthalmology",
                "Oral & Maxillofacial Surgery",
                "Orthopaedic Surgery",
                "Other Doctors",
                "Otolaryngology / Head & Neck Surgery",
                "Palliative Care",
                "Pathology",
                "Pediatrics",
                "Physical Medicine & Rehabilitation",
                "Physician Executive / Administrative",
                "Plastic & Reconstructive Surgery",
                "Podiatry",
                "Psychiatry",
                "Pulmonary Medicine / Critical Care",
                "Radiology",
                "Rheumatology",
                "Surgery",
                "Thoracic Surgery",
                "Urgent & Ambulatory Care",
                "Urology",
                "Vascular Surgery",
                "Women's Health / OBGYN",
                "Gynecological Oncology",
                "Gynecology - General",
                "Laborist",
                "Maternal & Fetal Medicine",
                "Obstetrics & Gynecology - General",
                "Urogynecology",
                "Vascular / Endovascular Surgery",
                "Vascular Surgery - General",
                "Pediatric Urologist",
                "Urology - General",
                "Pediatric Urgent Care Physician",
                "Urgent Care Physician - Urgent & Ambulatory Care",
                "Cardiothoracic Surgery",
                "Thoracic Surgery - General",
                "Bariatric Surgery",
                "Breast Surgery",
                "Colon & Rectal Surgery",
                "Critical Care Surgery",
                "Foot & Ankle Surgery, Podiatric",
                "Medical Director - Surgery",
                "Pediatric Surgery",
                "Residency / Fellowship / Internship - Surgery",
                "Surgery - General",
                "Surgical Oncology",
                "Transplant Surgery",
                "Trauma Surgery",
                "Pediatric Rheumatology",
                "Rheumatology - General",
                "Pediatric Radiology",
                "Radiology - General",
                "Residency / Fellowship / Internship - Radiology",
                "Critical Care / Intensivist",
                "Pediatric Pulmonary / Critical Care / Intensivist",
                "Pulmonary / Critical Care - General",
                "Sleep Medicine",
                "Addiction Psychiatry",
                "Adult Psychiatry",
                "Child & Adolescent Psychiatry",
                "Forensic Psychiatry",
                "Geriatric Psychiatry",
                "Psychiatrist - Sleep",
                "Psychiatry - General",
                "Residency / Fellowship / Internship - Psychiatry",
                "Podiatry - General",
                "Craniofacial Plastic & Reconstructive Surgery",
                "Hand Plastic & Reconstructive Surgery",
                "Plastic & Reconstructive Surgery - General",
                "Physician Administrative",
                "Physician Executive",
                "Physical Medicine & Rehabilitation - General",
                "Adolescent Medicine",
                "Pediatric Critical Care",
                "Pediatrics - General",
                "Anatomic / Clinical Pathology",
                "Cytopathology",
                "Molecular Genetic Pathology",
                "Pathology - General",
                "Pediatric Pathology",
                "Surgical Pathology",
                "Palliative Care Physician",
                "Head & Neck Surgery",
                "Laryngology",
                "Neurotology",
                "Otolaryngic Allergy",
                "Otolaryngic Facial Plastic & Reconstructive Surgery",
                "Otolaryngology - General",
                "Otology",
                "Pediatric Otolaryngology",
                "Rhinology",
                "Epidemiologist",
                "Nuclear Medicine Physician",
                "Physician - Other",
                "Wound Care Physician",
                "Orthopaedic Foot & Ankle Surgery",
                "Orthopaedic Hand Surgery",
                "Orthopaedic Spine Surgery",
                "Orthopaedic Sports Medicine",
                "Orthopaedic Surgery - General",
                "Orthopaedic Total Joints Surgery",
                "Orthopaedic Trauma Surgery",
                "Pediatric Orthopaedics",
                "Internships / Externships - Oral & Maxillofacial Surgery",
                "Oral & Maxillofacial Surgery - General",
                "Practice For Sale - Oral & Maxillofacial Surgery",
                "Residencies - Oral & Maxillofacial Surgery",
                "Neuro - Ophthalmology",
                "Ophthalmic Plastic Surgery / Reconstructive",
                "Ophthalmology - General",
                "Pediatric Ophthalmology / Strabismus",
                "Residency / Fellowship / Internship - Ophthalmology",
                "Occupational / Environmental Medicine - General",
                "Preventive Medicine",
                "Behavioral Neurology",
                "Child Neurology",
                "Epileptology",
                "Geriatric Neurology",
                "Headache Medicine",
                "Movement Disorders",
                "Neurohospitalist",
                "Neuroimmunology",
                "NeuroIntensivist",
                "Neurology - General",
                "Neurology - Stroke / Critical Care",
                "Neuromuscular Neurology",
                "NeuroOncology",
                "Neurophysiology",
                "Neuroradiology",
                "Residency / Fellowship / Internship - Neurology",
                "Vascular Neurology",
                "Cerebrovascular / Endovascular Neurological Surgery",
                "Neurological Surgery - General",
                "Pediatric Neurological Surgery",
                "Residency / Fellowship / Internship - Neurological Surgery",
                "Spine Neurological Surgery",
                "Trauma Neurological Surgery",
                "Nephrology - General",
                "Pediatric Nephrology",
                "Neonatology - General",
                "Internal Medicine / Pediatrics",
                "Medical Genetics - General",
                "Locum Tenens - Emergency Medicine",
                "Locum Tenens - Family Medicine",
                "Locum Tenens - Hematology / Oncology",
                "Locum Tenens - Neurology",
                "Locum Tenens - Obstetrics & Gynecology",
                "Internal Medicine - General",
                "Urgent Care Physician - Internal Medicine",
                "HIV Medicine - General",
                "Infectious Disease - General",
                "Pediatric Infectious Disease",
                "Hospitalist",
                "Nocturnist",
                "Pediatric Hospitalist",
                "Program Director",
                "Hematology / Oncology - General",
                "Orthopaedic Oncologist",
                "Pediatric Hematology / Oncology",
                "Radiation Oncology",
                "Family Geriatric Medicine",
                "Internal Geriatric Medicine",
                "Gastroenterology - General",
                "Gastroenterology - General - DDW",
                "Gastroenterology Surgery",
                "Hepatology",
                "Pediatric Gastroenterology",
                "Pediatric Gastroenterology - DDW",
                "Family Medicine - General",
                "Family Medicine with Obstetrics",
                "Family Sports Medicine",
                "Residency / Fellowship / Internship - Family Medicine",
                "Endocrinology - General",
                "Pediatric Endocrinology",
                "Reproductive Endocrinology",
                "Emergency Medicine - General",
                "Medical Director - Emergency Medicine",
                "Pediatric Emergency Medicine",
                "Residency / Fellowship / Internship - Emergency Medicine",
                "Urgent Care MD / DO",
                "Dermatology - General",
                "Dermatopathology",
                "Pediatric Dermatology",
                "Practice For Sale - Dermatology",
                "Adult Congenital Heart Disease Cardiology",
                "Cardiology - General",
                "Cardiovascular Surgery",
                "Electrophysiology",
                "Heart Failure Cardiology",
                "Invasive / Interventional Cardiology",
                "Invasive / Non - Interventional Cardiology",
                "Non - Invasive Cardiology",
                "Pediatric Cardiology",
                "Residency / Fellowship / Internship - Cardiology",
                "Anesthesiology - General",
                "Critical Care Anesthesiology",
                "Pain Management",
                "Pediatric Anesthesiology",
                "Allergy, Asthma & Immunology - General",
                "Pediatric Allergy, Asthma & Immunology",
            ]
        },
        {
            key: "Allied Health Jobs",
            value: [
                "Assistant",
                "Chiropractic",
                "Dental",
                "Education",
                "Laboratory Management / Supervisor",
                "Maintenance / Hospitality",
                "Optometry",
                "Orthotics & Prosthetics",
                "Paramedic",
                "Personal Trainer / Fitness Instructor",
                "Technologist / Technician",
                "Anesthesia Technologist",
                "Cardiac Catheterization Technologist",
                "Cardiovascular Technologist",
                "ECG / EKG Technologist",
                "Electroneurodiagnostic Technologist",
                "Electrophysiology Technologist",
                "Emergency Medicine Technician",
                "Hyperbaric Technologist",
                "Medical / Office Laboratory Technician",
                "Medical Device Engineer / Technician",
                "Medical Technician / Technologist",
                "Medical Technologist - Blood Bank",
                "Medical Technologist - Cytology",
                "Medical Technologist - Hematology",
                "Medical Technologist - Histology",
                "Medical Technologist - Microbiology",
                "Operating Room Technician",
                "Ophthalmic Technician",
                "Orthopaedic Technician",
                "Otolaryngology Technician",
                "Phlebotomy Technician",
                "Polysomnographic Technologist",
                "Psychiatric Technician",
                "Surgical / Operating Room Technologist",
                "Optometrist",
                "Chef / Cook",
                "Food Service Worker",
                "Housekeeping / Janitorial",
                "Maintenance",
                "Materials Management",
                "Diabetes Educator",
                "Environmental Health / Safety",
                "Genetics Counselor",
                "Dental Assistant",
                "Dental Hygienist",
                "Dental Technician",
                "Dentist - General",
                "Endodontist",
                "Orthodontist",
                "Pediatric Dentist",
                "Periodontist",
                "Chiropractor",
                "Anesthesiologist Assistant",
                "Medical Assistant",
                "Physical Therapy Assistant",
                "Phlebotomist"
            ]
        },
        {
            key: "Nursing Jobs",
            value: [
                "Advanced Practice Nurse",
                "Nurse Management",
                "Nursing Support",
                "Ambulatory Care - LPN / LVN / RPN",
                "General LPN / LVN / RPN",
                "MDS Coordinator",
                "Medical / Surgical - LPN / LVN / RPN",
                "Nursing Assistant / Certified Nursing Assistant",
                "Pediatric Critical Care - LPN / LVN / RPN",
                "Women's Health - LPN / LVN / RPN",
                "Administration - Nurse Manager",
                "Ambulatory Care - Director of Nursing",
                "Cardiac Catheterization Lab - Nurse Manager",
                "Cardiology / Telemetry - Nurse Manager",
                "Cardiovascular ICU - Nurse Manager",
                "Cardiovascular Services - Director of Nursing",
                "Case Management - Nurse Manager",
                "Chief Nursing Officer",
                "Community Health - Nurse Manager",
                "Critical Care - Director of Nursing",
                "Dermatology - Nurse Manager",
                "Emergency Room - Director of Nursing",
                "Emergency Room - Nurse Manager",
                "Endoscopy - Nurse Manager",
                "Gastroenterology - Nurse Manager",
                "General Ambulatory Care - Nurse Manager",
                "General Women's Health - Nurse Manager",
                "Geriatrics / Long Term Care - Director of Nursing",
                "Home Care - Nurse Manager",
                "Hospice - Director of Nursing",
                "Hospice - Nurse Manager",
                "LTC / Nursing Facility - Quality Assurance / Quality Improvement Coordinator",
                "Maternal / Child - Director of Nursing",
                "Maternal / Child - Nurse Manager",
                "Medical / Surgical - Director of Nursing",
                "Medical / Surgical - Nurse Manager",
                "Neonatal ICU - Nurse Manager",
                "Neuro Sciences - Director of Nursing",
                "Neuro Sciences - Nurse Manager",
                "Nursing Shift Supervisor",
                "Obstetrics - Nurse Manager",
                "Occupational Health - Nurse Manager",
                "Oncology - Director of Nursing",
                "Oncology - Nurse Manager",
                "Operating Room - Nurse Manager",
                "Orthopaedic - Nurse Manager",
                "Other - Nurse Manager / Executive",
                "Pediatrics - Nurse Manager",
                "Perioperative Services - Director of Nursing",
                "Psychiatric / Mental Health - Nurse Manager",
                "Psychiatry - Director of Nursing",
                "Radiology - Nurse Manager",
                "Recovery - Nurse Manager",
                "Surgery - Nurse Manager",
                "Surgical Services - Director of Nursing",
                "Surgical Services - Nurse Manager",
                "Adult Acute & Critical Care - CNS",
                "Adult Psychiatric / Mental Health - CNS",
                "Certified Nurse - Midwife / Certified Midwife",
                "Certified Registered Nurse Anesthetist (CRNA)",
                "Clinical Nurse Leader",
                "Emergency Room - CNS",
                "General Critical Care - CNS",
                "Medical / Surgical - CNS",
                "Neonatal / Perinatal - CNS",
                "Nurse Educator - CNS",
                "Nurse Faculty",
                "Oncology - CNS",
                "Licensed Practical/Vocational Nurse"
            ]
        },
        {
            key: "Registered Nurse Jobs",
            value: [
                "Registered Nurse",
                "Administration - RN",
                "Adult Critical Care - RN",
                "Ambulatory Care - RN",
                "Apheresis - RN",
                "Bariatric Surgery - RN",
                "Bone Marrow Transplant - RN",
                "Burn ICU - RN",
                "Cardiac Catheterization Lab - RN",
                "Cardiac Rehabilitation - RN",
                "Cardiac Surgery - RN",
                "Cardiology / Telemetry - RN",
                "Cardiopulmonary Rehabilitation - RN",
                "Cardiovascular ICU - RN",
                "Cardiovascular OR - RN",
                "Case Manager - RN",
                "Chemotherapy - RN",
                "Community Health - RN",
                "Dermatology - RN",
                "Education / Faculty - RN",
                "Emergency Medicine - RN",
                "Endocrinology - RN",
                "Endoscopy - RN",
                "Family Medicine - RN",
                "Gastroenterology - RN",
                "General Medical / Surgical - RN",
                "General Medicine - RN",
                "General Oncology - RN",
                "General Rehabilitation - RN",
                "General Surgery - RN",
                "General Women's Health - RN",
                "Geriatrics - RN",
                "Hemodialysis - RN",
                "Home Care - RN",
                "Hospice Care RN",
                "ICU - RN",
                "Infection Control Practitioner - RN",
                "Infectious Disease - RN",
                "Infusion - RN",
                "IV Therapy / Parenteral Nutrition - RN",
                "Labor & Delivery - RN",
                "Lactation Specialist - RN",
                "Legal Consultant - RN",
                "Long Term Care - RN",
                "LTC / Nursing Facility - Case Mix Nurse - RN",
                "MDS / Assessment Coordinator - RN",
                "Medical / Surgical Float - RN",
                "Medical ICU - RN",
                "Neonatal Critical Care / ICU - RN",
                "Neonatology - RN",
                "Nephrology - RN",
                "Neurosciences - RN",
                "Neurosurgery - RN",
                "Neurosurgical ICU - RN",
                "Nurse Clinician - RN",
                "Nursing Informatics RN",
                "Occupational Health - RN",
                "Operating Room - RN",
                "Ophthalmology - RN",
                "Orthopaedic - RN",
                "Otolaryngology - RN",
                "Pain Management - RN",
                "Palliative Care - RN",
                "Pediatric - RN",
                "Pediatric Critical Care / ICU - RN",
                "Pediatric Emergency Room - RN",
                "Pediatric Psychology - RN",
                "Perinatal - RN",
                "Post - Anesthesia Care Unit - RN",
                "Post - Partum Care - RN",
                "Pre - Anesthesia - RN",
                "Progressive Care / Step Down - RN",
                "Psychiatric / Mental Health - RN",
                "Quality Assurance RN",
                "Radiology - RN",
                "Research - RN",
                "Rheumatology RN",
                "Skilled Nursing - RN",
                "Substance Abuse - RN",
                "Surgical ICU - RN",
                "Telephone Triage - RN",
                "Transplant - RN",
                "Transplant Coordinator - RN",
                "Trauma - RN",
                "Travel - RN",
                "Urgent Care - RN",
                "Urology - RN",
                "Utilization Review - RN",
                "Wound Care - RN"
            ]
        },
        {
            key: "Nurse Practitioner Jobs",
            value: [
                "Acute & Critical Care - NP",
                "Adult - NP",
                "Allergy, Asthma & Immunology - NP",
                "Cardiology - NP",
                "Cardiothoracic Surgery - NP",
                "Dermatology - NP",
                "Education / Faculty - NP",
                "Emergency - NP",
                "Endocrinology - NP",
                "Family Medicine - NP",
                "Gastroenterology - NP",
                "General - NP",
                "Geriatrics - NP",
                "Hospice Care - NP",
                "Hospitalist - NP",
                "Infectious Disease - NP",
                "Internal Medicine - NP",
                "Neonatal - NP",
                "Nephrology - NP",
                "Neurology - NP",
                "Neurosurgery - NP",
                "Nocturnist - NP",
                "Occupational Health - NP",
                "Oncology - NP",
                "Orthopaedic - NP",
                "Otolaryngology - NP",
                "Pain Management - NP",
                "Palliative Care - NP",
                "Pediatric - NP",
                "Physiatry - NP",
                "Plastic Surgery- NP",
                "Psychiatric / Mental Health - NP",
                "Pulmonary Rehabilitation - NP",
                "Radiology - NP",
                "Rheumatology - NP",
                "School Health - NP",
                "Surgical - NP",
                "Thoracic Surgery - NP",
                "Urgent Care - NP",
                "Urology - NP",
                "Vascular Surgery - NP",
                "Women's Health / OBGYN - NP",
            ]
        },
        {
            key: "Physician Assistant Jobs",
            value: [
                "Acute and Critical Care - PA",
                "Allergy, Asthma & Immunology - PA",
                "Anesthesiology - PA",
                "Cardiology - PA",
                "Cardiothoracic Surgery - PA",
                "Dermatology - PA",
                "Education / Faculty - PA",
                "Emergency Medicine - PA",
                "Endocrinology - PA",
                "Family Medicine - PA",
                "Gastroenterology - PA",
                "General - PA",
                "Geriatrics - PA",
                "Hospitalist - PA",
                "Infectious Disease - PA",
                "Internal Medicine - PA",
                "Neonatal - PA",
                "Nephrology - PA",
                "Neurology - PA",
                "Neurosurgery - PA",
                "Nocturnist - PA",
                "Occupational Medicine - PA",
                "Oncology - PA",
                "Orthopaedic - PA",
                "Otolaryngology - PA",
                "Pain Management - PA",
                "Pediatric - PA",
                "Physiatry - PA",
                "Plastic Surgery - PA",
                "Psychiatric / Mental Health - PA",
                "Pulmonary Rehabilitation - PA",
                "Radiology - PA",
                "Rheumatology - PA",
                "Surgery - PA",
                "Thoracic Surgery - PA",
                "Urgent Care - PA",
                "Urology - PA",
                "Vascular Surgery - PA",
                "Women's Health / OBGYN - PA",
            ]
        },
        {
            key: "Pharmacy Jobs",
            value: [
                "APhA Employment",
                "Pharmacist - Academic",
                "Pharmacist - Chain Drug Store",
                "Pharmacist - Community",
                "Pharmacist - Health System",
                "Pharmacist - Long Term Care",
                "Pharmacist - Managed Care",
                "Pharmacy Management",
                "Pharmacy Resident",
                "Pharmacy Technician",
                "Pharmacy Technician - Certified"
            ]
        },
        {
            key: "Administration / Executive Jobs",
            value: [
                "Medical Biller",
                "Administration / Operations",
                "Executive / Management",
                "Finance / Accounting",
                "Human Resources",
                "Patient Services",
                "Practice Administrator",
                "Quality Assurance",
                "Sales & Marketing",
                "Marketing",
                "Medical Sales",
                "Sales and Marketing - General",
                "Central Sterile Management",
                "Central Sterile Processing Technician",
                "Claims Adjuster",
                "Quality Assurance - Laboratory Technologist",
                "Quality Assurance - Management",
                "Quality Assurance - Nurse",
                "Risk Management / Safety",
                "Cardiology Administrator",
                "Dermatology Administrator",
                "Emergency Medicine Administrator",
                "Practice Administrator - General",
                "Patient Activities",
                "Patient Advocacy",
                "Human Resources Executive / Management",
                "Human Resources Generalist",
                "Legal Services",
                "Physician Recruitment & Retention",
                "Recruitment (General HR(",
                "Training / Staff Development",
                "Accountant",
                "Billing",
                "Chief Financial Officer / Executive",
                "Coding",
                "Finance-Management",
                "Fundraising",
                "Patient Financial Services",
                "Payroll",
                "Chief Executive Officer",
                "Education Executive / Management",
                "Executive",
                "Operations / COO",
                "Administrative Director",
                "Administrative Support / Clerical",
                "Admissions",
                "Business Analyst",
                "Business Services",
                "Clinical Department Management",
                "Community / Public Relations",
                "Compliance",
                "Credentialing",
                "Department Management",
                "Engineering / Facilities Management",
                "Health Administration",
                "Healthcare Supply Chain",
                "Hospital Administrator / Assistant Administrator",
                "Medical Records",
                "Medical Transcription",
                "Office Manager",
                "Planning & Development",
                "Tumor / Cancer Registrar",
                "Healthcare Executive",
                "Medical Coder"
            ]
        },
        {
            key: "Counseling and Social Services Jobs",
            value: [
                "Addictions Counselor",
                "Child Life Specialist",
                "Cognitive / Behavioral Therapist",
                "Medical / Hospital Social Worker",
                "Mental Health Counselor / Therapist",
                "Neuropsychology",
                "Psychologist / Psychometrist",
                "Spiritual Care Provider"
            ]
        },
        {
            key: "Dietetics / Nutrition Jobs",
            value: [
                "Dietary Manager",
                "Dietetic Technician",
                "Dietitian / Nutritionist",
                "Education & Research-Dietetics"
            ]
        },
        {
            key: "Healthcare IT Jobs",
            value: [
                "Analyst - HIT",
                "Consultant - HIT",
                "Data Analysis",
                "Database Management",
                "Health Information Administrator",
                "Health Information Educator",
                "Healthcare Informatics",
                "IT Technology Management",
                "Project Management",
                "Software Development",
                "System Analysis",
                "Systems / Network Engineer",
                "Systems Security"
            ]
        }
    ];
    if (cats) {
        cats = cats.split('<br>');
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i];
            for (var j = 0; j < arrCatAvailable.length; j++) {
                var catAvailable = arrCatAvailable[j];
                if (catAvailable.value.indexOf(cat) > -1) {
                    catsConverted.push(catAvailable.key);
                }
            }
        }
    }

    job.specialty = catsConverted;
    // remove text Show Contact Details from description
    if (job.description) {
        if (job.description.indexOf('Show Contact Details') > -1) {
            job.description = job.description.replace(/Show Contact Details/g, '');
        }
        // extract How to apply, by Email or Website
        var emails = extractEmails(job.description);
        var websites = extractWebsite(job.description);
        var howToApply = '';
        if (emails) {
            howToApply = emails;
        } else {
            if (websites) {
                howToApply = websites;
            }
        }
        job.howToApply = howToApply;
    }
    // convert job posted date
    if (job.date) {
        var arrDate = job.date.split('/');
        var convertedDate = '';
        if (arrDate.length === 3) {
            convertedDate = arrDate[2] + '-' + arrDate[0] + '-' + arrDate[1] + ' 00:00:00';
        }
        job.date = convertedDate;
    }
    return job;
}

function extractEmails(text) {
    if (!text)
        return '';
    var arr = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if (arr && arr.length > 0) {
        return arr[0];
    } else {
        return '';
    }
}
function extractWebsite(text) {
    if (!text)
        return '';
    var arr = text.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g);
    if (arr && arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].indexOf('@') === -1) {
                return arr[i];
            }
        }
    }
    return '';
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function writeJSON(filePath, data, exitApp) {
    var fs = require('node-fs');
    var json = JSON.stringify(data);
    filePath = './' + filePath;
    fs.writeFile(filePath, json, null, function () {
        console.log('done write to file: %s', filePath);
        if (typeof exitApp === true)
            process.exit(0);
    });
}

// Functions chinh ********************************************************

// Rename collection to other name and create new collection
function start() {
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    MongoClient.connect(strConnection, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        var now = new Date().toLocaleString();
        db.collection('employers').rename('employers_bk_' + now);
        db.close();

        // Go to next step
        console.time('getListEpl');
        insertEmployersToMongoDb(true);
    });
}

// Get and insert employer list to mongodb (43 seconds)
function insertEmployersToMongoDb(runNextStep) {
    // Get employer detail
    var epl;
    var crlGetEplDetail = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            var t = thisUrl.split('/');
            var eplId = t[t.length - 1];
            var about = $('#empabout').html();
            var emailsContact = '';
            if (about) {
                emailsContact = extractEmails(about);
                if (emailsContact) {
                    if (emailsContact.length > 1) {
                        var emailsContact = emailsContact.filter(function (elem, index, self) {
                            var lastChar = elem[elem.length - 1];
                            // remove dot . in last char
                            if (lastChar === '.') {
                                elem = elem.slice(0, -1);
                            }
                            return index === self.indexOf(elem);
                        })
                    } else {
                        emailsContact = [emailsContact[0].slice(0, -1)];
                    }
                    emailsContact = emailsContact.join();
                }
            }
            var etc = $('.job-title-etc h2').text();
            var name = $('.job-title-etc h1').text();
            var logoUrl = $('.employer-logo img').attr('src');
            var logo = typeof logoUrl !== 'undefined' ? 'https://www.healthecareers.com' + logoUrl : '';
            var bannerUrl = $('.employer-hero img').attr('src');
            var banner = typeof bannerUrl !== 'undefined' ? 'https://www.healthecareers.com' + bannerUrl : '';
            var urlAllJobs = "https://www.healthecareers.com/search-jobs/?empid=" + eplId + "&specialty=*&ps=100";

            epl = {
                eplId: eplId,
                name: name,
                emailsContact: emailsContact,
                about: about,
                logo: logo,
                banner: banner,
                etc: etc,
                urlAllJobs: urlAllJobs,
                url: thisUrl
            };
            var arrEpls = [];
            arrEpls.push(epl);
            Epl.insertMany(arrEpls);

            done();
        }
    });
    crlGetEplDetail.on('drain', function () {
        console.timeEnd('getEplDetailAndInsert');
        if (runNextStep === true) {
            buildJSONLinkEmployers(true);
        } else {
            process.exit(0);
        }

    });

    var link = 'https://www.healthecareers.com/healthcare-employers';
    var letters = 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,1';
    var arrLetters = letters.split(',');
    var eplByLetter = [];
    var linkEpl = [];
    for (var i = 0; i < arrLetters.length; i++) {
        eplByLetter.push('https://www.healthecareers.com/healthcare-employers/?emplLetter=' + arrLetters[i].toUpperCase());
    }

    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            $('.grey-content a').each(function (i, el) {
                linkEpl.push($(this).attr('href'));
            });
            done();
        }
    });

    crl.queue(eplByLetter);
    crl.on('drain', function () {
        console.timeEnd('getListEpl');
        console.log(linkEpl.length);
        console.time('getEplDetailAndInsert');
        crlGetEplDetail.queue(linkEpl);
    });
}

// 81 seconds
function buildJSONLinkEmployers(runNextStep) {
    var arrLinks = [];
    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;

            var el = $('.pagination li');
            var l = el.length;
            var maxPage = 0;
            el.each(function (i, el) {
                if (i === l - 2) {
                    maxPage = parseInt($(this).text());
                    if (maxPage > 1) {
                        for (var j = 1; j < maxPage + 1; j++) {
                            arrLinks.push(thisUrl + '&pg=' + j);
                        }
                    } else {
                        arrLinks.push(thisUrl + '&pg=1');
                    }
                }
            });
            console.log('arrLinks: %s', arrLinks.length);
            done();
        }
    });
    // Emitted when queue is empty
    crl.on('drain', function () {
        console.timeEnd('buildUrlJobDetail');

        var fs = require('node-fs');
        var json = JSON.stringify(arrLinks);
        var filePath = './' + fileLinksEmployers;
        fs.writeFile(filePath, json, null, function () {
            console.log('done write to file: %s', filePath);
            if (runNextStep === true) {
                getListJobs(true);
            } else {
                process.exit();
            }
        });

    });
    // Get all urlAllJobs
    Epl.find({
        urlAllJobs: {
            $not: {$type: 10},
            $exists: true
        }
    }, function (err, empl) {
        if (err) throw err;
        if (empl.length > 0) {
            var arr = [];
            for (var i = 0; i < empl.length; i++) {
                arr.push(empl[i].urlAllJobs);
            }
            // build array list url job detail
            console.time('buildUrlJobDetail');
            crl.queue(arr);
        }
    });
}

function getListJobs(runNextStep) {
    try {
        var jobUrls = require('./' + fileLinksEmployers);
    } catch (ex) {
        console.log('File %s not exist!', fileLinksEmployers);
    }

    jobUrls = jobUrls.toString().split(',');

    var arr = [];
    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            $('.search-result-list').each(function (i, el) {
                var t = $(this);
                var jobUrl = t.find('a').attr('href');
                jobUrl += '#' + getParameterByName('empid', thisUrl);
                arr.push(jobUrl);
            });
            console.timeEnd('getJobUrl');
            console.log(thisUrl, arr.length);

            done();
        }
    });
    console.time('getJobUrl');
    crl.queue(jobUrls);
    // var temp = ['https://www.healthecareers.com/search-jobs/?empid=349519&specialty=*&ps=100&pg=1'];
    // crl.queue(temp);
    crl.on('drain', function () {
        console.log('length now %s', arr.length);
        if (runNextStep === true) {
            var fs = require('node-fs');
            var json = JSON.stringify(arr);
            var filePath = './' + fileJobsList;
            fs.writeFile(filePath, json, null, function () {
                console.log('done write to file: %s', filePath);
                getJobDetail(true);
            });
        } else {
            process.exit();
        }
    });
}

// Get job detail and insert to mongodb
function getJobDetail(runNextStep) {
    try {
        var jobsList = require('./' + fileJobsList);
    } catch (ex) {
        console.log('File %s not exist', fileJobsList);
    }

    jobsList = jobsList.toString().split(',');

    var crl = new Crawler({
        rateLimit: 0,
        maxConnections: 10,
        callback: function (error, res, done) {
            var $ = res.$;
            var thisUrl = res.request.uri.href;
            var panel = $('.tab-pane-content');
            var jobTitle = panel.find('h1').text().trim();
            var location = panel.find('h2').text().trim();
            var description = panel.find('.job-description').html();

            var date, jobId, type, vwa, specialty;
            $('.details-data li').each(function (i, el) {
                var _t = $(this);
                var text = _t.find('label').text();
                if (text === 'Date Posted:') {
                    date = _t.find('p').text().trim();
                } else if (text === 'Job Id:') {
                    jobId = _t.find('p').text().trim();
                } else if (text === 'Employment Type(s):') {
                    type = _t.find('p').text().trim();
                } else if (text === 'Visa Waiver Available:') {
                    vwa = _t.find('p').text().trim();
                } else if (text === 'Specialty:') {
                    specialty = _t.find('p').html().trim();
                }
            });
            var findEplId = /empid=(\d+)/.exec($('h4.center a').attr('href'));
            var employerId = thisUrl.split('#');
            employerId = employerId[1];
            var job = {
                employerId: employerId,
                jobId: jobId,
                title: jobTitle,
                description: description,
                location: location,
                date: date,
                type: type,
                vwa: vwa,
                specialty: specialty,
                url: thisUrl,
                inserted: 0
            };

            // Viet function check exist ra ngoai roi moi push
            Epl.update(
                {eplId: employerId},
                {$push: {jobs: job}},
                function (err) {
                    if (err) console.log(err);
                    else console.log('Employer %s have jobs changed', employerId);
                }
            );

            done();
        }
    });
    console.time('pushJob');
    crl.queue(jobsList);

    // uncomment below lines to test
    // var temp = ['https://www.healthecareers.com/job/ent-md/1822440'];
    // crl.queue(temp);

    crl.on('drain', function () {
        setTimeout(function () {
            console.timeEnd('pushJob');
            if (runNextStep === true) {
                // step 5
                console.time('addEpmployerToSmartJob');
                schedulerAddUsers();
            } else {
                process.exit(0);
            }

        }, 3000);
    });
}

var wait = 1;
function schedulerAddUsers() {
    setTimeout(function () {
        Epl.find({inserted: 0}, function (err, obj) {
            if (err) throw err;
            if (obj.length > 0) {
                obj = obj[0];
                console.log('Inserting employer %s', obj.eplId);
                addEmployer(obj);
            } else {
                console.log('Total time:');
                console.timeEnd('addEpmployerToSmartJob');
                console.log('Finish add users');
                console.log(arrInsertedEpl);

                // write to json file
                var fs = require('node-fs');
                var json = JSON.stringify(arrInsertedEpl);
                var filePath = defaultDir + 'arrayEplInserted.json';
                fs.writeFile(filePath, json, null, function () {
                    console.log('done write to file: %s', filePath);

                    console.time('buildJSONJobsAddToSJB');
                    schedulerBuildJSONJobs();
                });
            }
        }).limit(1);
    }, wait * 1000);
}

try {
    var existedEpl = require(defaultDir + 'existed-employers-in-SJB.json');
} catch (ex) {
    console.log('File not exist: %s', defaultDir + 'existed-employers-in-SJB.json');
}

function addEmployer(obj) {

    for (var i = 0; i < existedEpl.length; i++) {
        var e = existedEpl[i];
        if (obj.eplId.toString() === e.sourceEplId.toString()) {
            console.log('Employer name %s exited', obj.name);
            updateInserted(obj.eplId, 1);
            schedulerAddUsers();
            return;
        }
    }

    var url = originPath + 'employers?api_key=' + apiKey;
    var email = randomEmail(),
        cpnName = obj.name,
        cpnDescription = obj.about,
        etc = obj.etc,
        logo = obj.logo,
        banner = obj.banner,
        source = obj.url,
        emailContacts = obj.emailsContact
    ;

    // dont insert empty etc
    if (etc === ',  ')
        etc = '';
    if (etc[0] === ',')
        etc = etc.substring(1).trim();
    if (cpnName === '') {
        // if empty company name then git it from url ahihi
        var arrUrl = obj.url.split('/');
        arrUrl = arrUrl[arrUrl.length - 2];
        arrUrl = arrUrl.split('-').join(' ');
        cpnName = arrUrl;
    }

    // if(obj.logo){
    //     uploadToS3(obj.logo, 'isLogo');
    //     logo = 'https://health-job.s3.amazonaws.com/logo/' + extractFileName(obj.logo);
    // }
    // if(obj.banner){
    //     uploadToS3(obj.banner);
    //     banner = 'https://health-job.s3.amazonaws.com/logo/' + extractFileName(obj.banner);
    // }
    // console.log('logo %s', logo);
    // console.log('banner %s', banner);

    var body = {
        'password': 'yourdefaultpassword',
        'email': email,
        'registration_date': '',
        'active': 1,
        'featured': 0,
        'company_name': cpnName,
        'company_description': cpnDescription,
        'full_name': cpnName,
        'location': etc,
        'phone': '0966666666',
        'logo': logo,
        // 'website': obj.eplId.toString(),
        'website': extractWebsite(cpnDescription),
        'custom_fields': [
            {
                name: 'Logo Url',
                value: logo
            },
            {
                name: 'Banner Url',
                value: banner
            },
            {
                name: 'Source Url',
                value: source
            },
            {
                name: 'Email Contacts',
                value: emailContacts
            },
            {
                name: "Source Employer Id",
                value: obj.eplId.toString()
            },
            {
                name: "Employer Logo",
                value: logo
            }
        ]
    };

    request.post({
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }, function (err, res, body) {
        if (typeof res.statusCode === 'undefined') {
            console.log('###########################Error############################');
            console.log(res);
            process.exit();
        }
        if (!err && res.statusCode === 201) {
            console.log('successful');
            body = JSON.parse(body);
            var eplId = 0;
            for (var i = 0; i < body.custom_fields.length; i++) {
                var t = body.custom_fields[i];
                if (t.name === 'Source Employer Id') {
                    eplId = parseInt(t.value);
                }
            }
            arrInsertedEpl.push({
                jbId: body.id,
                eplId: eplId
            });
            updateInserted(obj.eplId, 1);
            schedulerAddUsers();
        } else {
            console.log('Code %s', res.statusCode);
            console.log(res);
        }
    });
}

function schedulerBuildJSONJobs() {
    var arrJobs = [];
    var waitJob = 0;
    var countCurrentEmployer = 1;

    function build() {
        setTimeout(function () {
            Epl.find({inserted: 1}, function (err, obj) {
                if (err) throw err;
                if (obj.length) {
                    obj = obj[0];
                    if (obj.jobs.length > 0) {
                        arrJobs = arrJobs.concat(obj.jobs);
                        console.log('No %s | employer %s | length now %s', countCurrentEmployer, obj.eplId, arrJobs.length);
                    }

                    // stop here to test
                    // if(countCurrentEmployer === 20){
                    //     writeJSON('./json-files/array-jobs-will-add-to-SmartJobBoard.json', arrJobs, true);
                    //     console.timeEnd('buildJSONJobsAddToSJB');
                    // }
                    // end

                    countCurrentEmployer++;
                    updateInserted(obj.eplId, 0);
                    build();
                } else {
                    console.log('array %s', arrJobs.length);
                    var fs = require('node-fs');
                    var json = JSON.stringify(arrJobs);
                    var filePath = defaultDir + 'array-jobs-will-add-to-SmartJobBoard.json';
                    fs.writeFile(filePath, json, null, function () {
                        console.log('done write to file: %s', filePath);

                        console.time('addJobToSmartJob');
                        addJobsToSJB();
                    });
                    console.timeEnd('buildJSONJobsAddToSJB');
                }

            }).limit(1);
        }, waitJob * 1000);
    }
    build();
}

// Tao file json cac jobs da ton tai trong smart job board
function buildJSON_existedJobs_inSJB() {
    var page = 1;
    var arrExistedJobs = [];

    function build() {
        var limit = 100, query = '', location = '', category = '';
        var url = originPath + 'jobs?limit=' + limit + '&page=' + page + '&api_key=' + apiKey;
        console.log('page %s | arrExistedJobs.length: %s | limit %s | url: %s', page, arrExistedJobs.length, limit, url);
        request(url, function (error, response, body) {
            if (response.statusCode !== 200) {
                console.log('Error code %s', response.statusCode);
                console.log(body);
                process.exit();
            }
            body = JSON.parse(body);
            var jobs = body.jobs;
            if (jobs.length === 0) {
                var fs = require('node-fs');
                var json = JSON.stringify(arrExistedJobs);
                filePath = defaultDir + 'existed-jobs-in-SJB.json';
                fs.writeFile(filePath, json, null, function () {
                    console.log('done write to file: %s', filePath);
                    buildJSON_existedEmployers_inSJB();
                });
                return;
            }
            for (var i = 0; i < jobs.length; i++) {
                var j = jobs[i];
                var customFields = j.custom_fields;
                var e = {sourceJobId: '', sourceEplId: ''};
                for (var k = 0; k < customFields.length; k++) {
                    var ctf = customFields[k];
                    if (ctf.name === 'Source Job Id')
                        e.sourceJobId = ctf.value;
                    else if (ctf.name === 'Source Employer Id')
                        e.sourceEplId = ctf.value;
                }
                arrExistedJobs.push(e);
            }
            page++;
            build();
            console.log(arrExistedJobs.length);
            console.timeEnd('get100Jobs');
        });
    }
}

// Tao file json cac epl da ton tai trong smart job board
function buildJSON_existedEmployers_inSJB() {
    var pageEpl = 1;
    var arrEpl = [];

    function build() {
        var limit = 100;
        var url = originPath + 'employers?limit=' + limit + '&page=' + pageEpl + '&api_key=' + apiKey;
        console.log('page %s | arrEpl.length: %s | limit %s | url: %s', pageEpl, arrEpl.length, limit, url);
        request(url, function (error, response, body) {
            if (response.statusCode !== 200) {
                console.log('Error code %s', response.statusCode);
                console.log(body);
                process.exit();
            }

            body = JSON.parse(body);
            var employers = body.employers;
            if (employers.length === 0) {
                var fs = require('node-fs');
                var json = JSON.stringify(arrEpl);
                filePath = defaultDir + 'existed-employers-in-SJB.json';
                fs.writeFile(filePath, json, null, function () {
                    console.log('done write to file: %s', filePath);
                    start();
                });
                return;
            }
            for (var i = 0; i < employers.length; i++) {
                var j = employers[i];
                var customFields = j.custom_fields;
                var e = {sourceEplId: '', url: '', sjbEplId: j.id};
                for (var k = 0; k < customFields.length; k++) {
                    var ctf = customFields[k];
                    if (ctf.name === 'Source Employer Id')
                        e.sourceEplId = ctf.value;
                    else if (ctf.name === 'Source Url')
                        e.url = ctf.value;
                }
                arrEpl.push(e);
            }
            pageEpl++;
            build();
            console.log(arrEpl.length);
            console.timeEnd('get100Epl');
        });
    }
    build();
}

// Update mongo set eplId inserted is 0 or 1
function updateInserted(eplId, inserted, printMessage) {
    Epl.findOneAndUpdate({eplId: eplId}, {inserted: inserted}, function (err, epl) {
        if (err) throw err;
        if (printMessage === true)
            console.log('updated inserted status %s', eplId);
    });
}

// Insert job to Smart job board
try {
    var jobsJSON = require(defaultDir + 'array-jobs-will-add-to-SmartJobBoard.json');
    var fileArrayEplInserted = require(defaultDir + 'arrayEplInserted.json');
    var existedEplInSJB = require(defaultDir + 'existed-employers-in-SJB.json');

    var filePathTrackingJobsInserted = defaultDir + 'trackingJobsInserted.json';
    var trackingJobsInserted = require(filePathTrackingJobsInserted);
    var existedJobsInSJB = require(defaultDir + 'existed-jobs-in-SJB.json');
} catch (ex) {
    console.log('File not exist');
    throw ex;
}

var sendingData_trackToDebug = [];
function addJobsToSJB() {
    // exit when finish
    if (typeof jobsJSON[0] === 'undefined') {
        console.log('Import jobs done. Exit');
        console.timeEnd('addJobToSmartJob');
        writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        return;
    }
    var job = jobsJSON[0];
    console.log('Jobs inserted to SJB: %s ', trackingJobsInserted.length);
    // if (trackingJobsInserted.length > 0) {
    //     for (var i = 0; i < trackingJobsInserted.length; i++) {
    //         var temp = trackingJobsInserted[i];
    //         if (job.jobId === temp.sourceJobId) {
    //             console.log('This job already inserted. Skip');
    //             sliceAndContinueAddJob();
    //             return;
    //         }
    //     }
    // }
    if(job.jobId){
        if (existedJobsInSJB.length > 0) {
            for (var i = 0; i < existedJobsInSJB.length; i++) {
                var _j = existedJobsInSJB[i];
                if (_j.sourceJobId.toString() === job.jobId.toString()) {
                    // console.log('This job already existed in SJB. Skip');
                    console.log('Skip');
                    sliceAndContinueAddJob();
                    return;
                }
            }
        }
    }

    // data
    var arrTags = [];
    if (job.specialty)
        arrTags = job.specialty.split('<br>');
    var tags = '';
    if (arrTags.length > 0) {
        for (var i = 0; i < arrTags.length; i++) {
            tags += arrTags[i] + ' job';
            tags = tags.replace(/NP/g, 'Nurse Practitioner');
            tags = tags.replace(/RN/g, 'Registered Nurse');
            tags = tags.replace(/NP/g, 'Physician Assistant');
            if (i !== arrTags.length - 1)
                tags += ', ';
        }
    }

    job = dataCleaned(job);
    // var eplId = 0;
    // for (var i = 0; i < fileArrayEplInserted.length; i++) {
    //     var el = fileArrayEplInserted[i];
    //     if (parseInt(job.employerId) === parseInt(el.eplId)) {
    //         eplId = el.jbId;
    //     }
    // }
    // eplId = parseInt(eplId);

    var eplId = 0;
    for(var i = 0; i < existedEplInSJB.length; i++){
        var el = existedEplInSJB[i];
        if(parseInt(job.employerId) === parseInt(el.sourceEplId)){
            eplId = parseInt(el.sjbEplId);
        }
    }
    // If this eplId not match any ejbEplId then return, it error
    if(eplId === 0){
        console.log('This employer id not exist in Smart job board. Skip');
        sliceAndContinueAddJob();
        return;
    }

    var title = job.title ? job.title : 'default job title';

    var url = originPath + 'jobs?api_key=' + apiKey;
    var data = {
        "active": 1,
        "featured": 0,
        "activation_date": job.date,
        // "expiration_date": "", // error
        "employer_id": eplId,
        "title": title,
        "job_type": job.type,
        "categories": job.specialty,
        "location": job.location,
        "description": job.description,
        // 'product': 'Free job posting',
        "custom_fields": [
            {
                name: 'Tags',
                value: tags
            },
            {
                name: 'Source Employer Id',
                value: job.employerId
            },
            {
                name: 'Source Job Id',
                value: job.jobId
            },
            // {
            //     name: 'Source Url',
            //     value: job.url
            // }
        ]
    };

    if(job.howToApply){
        data.how_to_apply = job.howToApply;
    }
    // save this array to debug when error
    sendingData_trackToDebug = data;
    // console.log(body);process.exit();

    request.post({
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }, function (err, res, body) {
        if (typeof res.statusCode === 'undefined') {
            console.log('###########################Error############################');
            console.log(res);
            writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        }
        if (!err && res.statusCode === 201) {
            trackingJobsInserted.push({
                sourceJobId: job.jobId,
                sourceEmployerId: job.employerId
            });

            countInsertedJob++;
            body = JSON.parse(body);
            console.timeEnd('addJobToSmartJob');
            console.log('Count %s | successful! new job id: %s belong to employer id %s', countInsertedJob, body.id, body.employer_id);

            // console.log(body);
            // process.exit();

            // remove index 0 from array
            sliceAndContinueAddJob();
        } else {
            console.log('########################Error when add new job to SJB################################');
            console.log('Code %s', res.statusCode);
            console.log('#########################Data sending###############################');
            console.log(data);
            writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        }
    });
}

function testAddJob() {
    var url = originPath + 'jobs?api_key=' + apiKey;
    var data = {
        "active": 1,
        "featured": 0,
        "activation_date": '2017-5-30 00:00:00',
        "employer_id": 2912,
        "title": 'Physician - Hospitalist - 105911',
        "job_type": 'Part Time',
        "categories": [ 'Academics / Research', 'Physician and Surgeon Jobs' ],
        "location": 'Virginia',
        "description": '\n\t\t\t\t\t\t\t<ul>\t<li>Inpatient hospital located 30 minutes west of Norfolk</li>\t<li>Immediate start upon credentialing (60 days) and ongoing</li>\t<li>7 on 7 off 7 AM-7 PM</li>\t<li>Average 18-20 patients per shift; no procedures required</li>\t<li>Travel provided as needed including mileage reimbursement</li>\t<li>Malpractice covered</li></ul><p></p><p><br>105911&gt;</p><p><strong>Contact Information</strong></p>Please Click Apply!',
    };

    request.post({
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }, function (err, res, body) {
        if (typeof res.statusCode === 'undefined') {
            console.log('###########################Error############################');
            console.log(res);
            writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        }
        if (!err && res.statusCode === 201) {
            console.log('success');
        } else {
            console.log('########################Error when add new job to SJB################################');
            console.log('Code %s', res.statusCode);
            console.log('#########################Data sending###############################');
            console.log(data);
        }
        process.exit();
    });
}

function sliceAndContinueAddJob() {
    jobsJSON.splice(0, 1);
    console.log('Remain %s', jobsJSON.length);
    addJobsToSJB();
}


// ******************************Chay tam*********************************
// getListJobs(true);
// getJobDetail();

// console.time('addEpmployerToSmartJob');
// schedulerAddUsers();

// console.time('buildJSONJobsAddToSJB');
// schedulerBuildJSONJobs();

// console.time('get100Epl');
// buildJSON_existedEmployers_inSJB();

// try{
//     console.time('addJobToSmartJob');
//     addJobsToSJB();
// }catch (ex){
//     console.log('Error when sending this data');
//     console.log(sendingData_trackToDebug);
//     writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
//     throw ex;
// }

// testAddJob();