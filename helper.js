// Smart job board API key
var apiKey = 'f59b583aa1b4ada293a40f17c10adabc';
var originPath = 'https://health.mysmartjobboard.com/api/';
var request = require('request');
var defaultDir = './json-files/';

module.exports = {
    randomEmail: function () {
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
    },
    extractFileName: function (fileUrl) {
        var arrFn = fileUrl.split('/');
        var ext = (arrFn[arrFn.length - 1].split('.'))[1];
        var filePathWithName = arrFn[arrFn.length - 2];
        filePathWithName = filePathWithName + '.' + ext;
        return filePathWithName;
    },
    dataCleaned: function (job) {
        // match job type
        var arrJobType = ['Full Time', 'Part Time', 'Contractor', 'Intern', 'Seasonal', 'Volunteer', 'Internship', 'Freelance', 'Temporary', 'Permanent'];
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

        job.catsConverted = catsConverted;
        // remove text Show Contact Details from description
        if (job.description) {
            if (job.description.indexOf('Show Contact Details') > -1) {
                job.description = job.description.replace(/Show Contact Details/g, '');
            }
            // extract How to apply, by Email or Website
            var emails = this.extractWebsite(job.description);
            var websites = this.extractWebsite(job.description);
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
            // var arrDate = job.date.split('/');
            // var convertedDate = '';
            // if (arrDate.length === 3) {
            //     convertedDate = arrDate[2] + '-' + arrDate[0] + '-' + arrDate[1] + ' 00:00:00';
            // }
            // job.date = convertedDate;
            job.date = this.convertDate(job.date);
        }
        return job;
    },
    extractEmails: function (text) {
        if (!text)
            return '';
        var arr = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        if (arr && arr.length > 0) {
            var email = arr[0];
            var lastChar = email[email.length - 1];
            if (lastChar === '.') {
                email = email.slice(0, -1);
            }
            return email;
        } else {
            return '';
        }
    },
    extractWebsite: function (text) {
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
    },
    getParameterByName: function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    buildJSON_existedJobs_inSJB: function () {
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
                    var filePath = defaultDir + 'existed-jobs-in-SJB.json';
                    fs.writeFile(filePath, json, null, function () {
                        console.log('done write to file: %s', filePath);
                        console.time('get100Epl');
                        this.buildJSON_existedJobs_inSJB();
                    });
                    return;
                }
                for (var i = 0; i < jobs.length; i++) {
                    var j = jobs[i];
                    var customFields = j.custom_fields;
                    var e = {sourceJobId: '', sourceEplId: '', ejbJobId: j.id};
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
        build();
    },
    buildJSON_existedEmployers_inSJB: function () {
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
                        // start();
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
    },
    getProxy: function () {
        console.log('Start get proxy');
        console.time('getProxy');
        var ProxyLists = require('proxy-lists');
        var options = {
            countries: ['us'],
            bitproxies: {
                apiKey: 'GCOWR9G8fWalzG1tjQeKM6vRU4H19pzM'
            },
            kingproxies: {
                apiKey: 'e3e36e6755857958654d6ff7970f22'
            },
            anonymityLevels: ['elite']
        };
        var arr = [];
        // `gettingProxies` is an event emitter object.
        var gettingProxies = ProxyLists.getProxies(options);
        gettingProxies.on('data', function(proxies) {
            // Received some proxies.
            arr = arr.concat(proxies);
        });
        gettingProxies.on('error', function(error) {
            // Some error has occurred.
            console.error(error);
        });
        gettingProxies.once('end', function() {
            // Done getting proxies.
            var fs = require('node-fs');
            var json = JSON.stringify(arr);
            var filePath = defaultDir + 'proxies.json';
            fs.writeFile(filePath, json, null, function () {
                console.log('done write to file: %s', filePath);
                console.timeEnd('getProxy');
                // insertEmployersToMongoDb();
            });
        });
    },
    convertDate: function (strDate) {
        var arrDate = strDate.split('/');
        var convertedDate = '';
        if (arrDate.length === 3) {
            convertedDate = arrDate[2] + '-' + arrDate[0] + '-' + arrDate[1] + ' 00:00:00';
        }
        return convertedDate;
    }
};