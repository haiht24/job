var request = require('request');
var apiKey = 'f59b583aa1b4ada293a40f17c10adabc';
var originPath = 'https://health.mysmartjobboard.com/api/';

var arrInsertedEpl = [];
var countInsertedJob = 0;

function dataCleaned(job) {
    // match job type
    var arrJobType = ['Full Time', 'Part Time', 'Contractor', 'Intern', 'Seasonal', 'Volunteer', 'Internship'];
    var jobType = job.type;
    var strJobTypes = '';
    if(jobType){
        for(var i=0;i<arrJobType.length;i++){
            var jt = arrJobType[i];
            if(jobType.indexOf(jt) > -1){
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
            key: 'Academics / Research',
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
            key: "Radiologic Technologist / Medical Imaging",
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
            key: "Counseling and Social Services",
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
            key: "Dietetics / Nutrition",
            value: [
                "Dietary Manager",
                "Dietetic Technician",
                "Dietitian / Nutritionist",
                "Education & Research-Dietetics"
            ]
        },
        {
            key: "Healthcare IT",
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
    if(cats){
        cats = cats.split('<br>');
        for(var i=0;i<cats.length;i++){
            var cat = cats[i];
            for(var j=0;j<arrCatAvailable.length;j++){
                var catAvailable = arrCatAvailable[j];
                if(catAvailable.value.indexOf(cat) > -1){
                    catsConverted.push(catAvailable.key);
                }
            }
        }
    }

    job.specialty = catsConverted;
    // remove text Show Contact Details from description
    if(job.description){
        if(job.description.indexOf('Show Contact Details') > -1){
            job.description = job.description.replace(/Show Contact Details/g, '');
        }
        // extract How to apply, by Email or Website
        var emails = extractEmails(job.description);
        var websites = extractWebsite(job.description);
        var howToApply = '';
        if(emails){
            howToApply = emails;
        }else{
            if(websites){
                howToApply = websites;
            }
        }
        job.howToApply = howToApply;
    }
    // convert job posted date
    if(job.date){
        var arrDate = job.date.split('/');
        var convertedDate = '';
        if(arrDate.length === 3){
            convertedDate = arrDate[2] + '-' + arrDate[1] + '-' + arrDate[0] + ' 00:00:00';
        }
        job.date = convertedDate;
    }
    return job;
}

function extractEmails (text){
    if(!text)
        return '';
    var arr = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    if(arr && arr.length > 0){
        return arr[0];
    }else{
        return '';
    }
}
function extractWebsite(text) {
    if(!text)
        return '';
    var arr = text.match(/(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g);
    if(arr && arr.length > 0){
        for(var i=0;i<arr.length;i++){
            if(arr[i].indexOf('@') === -1){
                return arr[i];
            }
        }
    }
    return '';
}

var writeJSON = function (filePath, data, exitApp) {
    var fs = require('node-fs');
    var json = JSON.stringify(data);
    filePath = './' + filePath;
    fs.writeFile(filePath, json, null, function () {
        console.log('done write to file: %s', filePath);
        if(typeof exitApp !== 'undefined')
            process.exit(0);
    });
};

function randomEmail() {
    var text = "";
    var alphabet = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,r,s,t,u,v,w,x,y,z".split(",");
    var wordCount = 1;
    for(var i=0; i<wordCount; i++) {
        var rand = null;
        for (var x=0; x<36; x++) {
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

function uploadToS3(fileUrl, isLogo) {
    // Config
    var accessKeyId = 'AKIAJIG5BNDKOMBNU4IA';
    var secretAccessKey = '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';
    // var region = 'ap-southeast-1';
    var bucketName = 'health-job';
    // End config

    var AWS = require('aws-sdk'),
        fs = require('fs');
    AWS.config.update({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey });

    // var fileUrl = 'https://www.healthecareers.com/binaries/content/gallery/healthecareers-us-en/employer-profiles/c/a/cambridge-health-alliance/logo.jpg';
    var request = require('request').defaults({ encoding: null });
    request.get(fileUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var ct = response.headers['content-type'];
            ct = ct.split(';');
            ct = ct[0];
            var filePathWithName = extractFileName(fileUrl);
            if(typeof isLogo !== 'undefined')
                filePathWithName = 'logo/' + filePathWithName;
            else
                filePathWithName = 'banner/' + filePathWithName;

            var s3 = new AWS.S3();
            s3.upload({
                Bucket: bucketName,
                Key: filePathWithName,
                Body: body,
                ACL: 'public-read',
                ContentType: ct
            },function (resp) {
                // console.log(arguments);
                // process.exit();
                console.log('uploaded : %s', filePathWithName);
            });
        }
    });
}

var wait = 1;
var Epl = require('./models/Employer');
function schedulerAddUsers() {
    setTimeout(function () {
        Epl.find({inserted: 0}, function (err, obj) {
            if(err) throw err;
            if(obj.length){
                obj = obj[0];
                console.log('Inserting employer %s', obj.eplId);
                addEmployer(obj);
            }else{
                console.log('Total time:');
                console.timeEnd('addEpmployerToSmartJob');
                console.log('Finish add users');
                console.log(arrInsertedEpl);
                writeJSON('./json-files/arrayEplInserted.json', arrInsertedEpl, true);
            }
        }).limit(1);
    }, wait*1000);
}

function updateInserted(eplId, inserted, printMessage) {
    Epl.findOneAndUpdate({eplId: eplId}, { inserted: inserted }, function(err, epl) {
        if (err) throw err;
        if(printMessage === true)
            console.log('updated inserted status %s', eplId);
    });
}

function addEmployer(obj) {
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
    if(etc === ',  ')
        etc = '';
    if(etc[0] === ',')
        etc = etc.substring(1).trim();
    if(cpnName === ''){
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
                name : 'Banner Url',
                value : banner
            },
            {
                name : 'Source Url',
                value : source
            },
            {
                name : 'Email Contacts',
                value : emailContacts
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
        if(typeof res.statusCode === 'undefined'){
            console.log('###########################Error############################');
            console.log(res);
            process.exit();
        }
        if (!err && res.statusCode === 201) {
            console.log('successful');
            body = JSON.parse(body);
            console.log(body.id);
            arrInsertedEpl.push({
                jbId: body.id,
                eplId: body.website
            });
            // console.log(body);
            // process.exit();return;
            updateInserted(obj.eplId, 1);
            schedulerAddUsers();
        }else{
            console.log('Code %s', res.statusCode);
            console.log(res);
        }
    });
}

var jobsJSON = require('./json-files/' + 'array-jobs-will-add-to-wordpress.json');
var fileArrayEplInserted = require('./json-files/' + 'arrayEplInserted.json');

var filePathTrackingJobsInserted = './json-files/trackingJobsInserted.json';
var trackingJobsInserted = require(filePathTrackingJobsInserted);
function addJobs() {
    // exit when finish
    if(typeof jobsJSON[0] === 'undefined'){
        console.log('Import jobs done. Exit');
        console.timeEnd('addJobToSmartJob');
        writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
    }
    var job = jobsJSON[0];
    console.log('tracking ', trackingJobsInserted.length);
    for(var i=0;i<trackingJobsInserted.length;i++){
        var temp = trackingJobsInserted[i];
        if(job.jobId === temp.sourceJobId){
            console.log('This job already inserted. Skip');
            sliceAndContinueAddJob();
            return;
        }
    }

    // data
    var arrTags = [];
    if(job.specialty)
        arrTags = job.specialty.split('<br>');
    var tags = '';
    if(arrTags.length > 0){
        for(var i=0;i<arrTags.length;i++){
            tags += arrTags[i] + ' job';
            tags = tags.replace(/NP/g, 'Nurse Practitioner');
            tags = tags.replace(/RN/g, 'Registered Nurse');
            tags = tags.replace(/NP/g, 'Physician Assistant');
            if(i !== arrTags.length - 1)
                tags += ', ';
        }
    }

    job = dataCleaned(job);

    var eplId = 0;
    for(var i=0;i<fileArrayEplInserted.length;i++){
        var el = fileArrayEplInserted[i];
        if(job.employerId === el.eplId){
            eplId = el.jbId;
        }
    }
    eplId = parseInt(eplId);
    var title = job.title ? job.title : 'default job title';

    var url = originPath + 'jobs?api_key=' + apiKey;
    var body = {
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
        "how_to_apply": job.howToApply,
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
    // console.log(body);process.exit();

    request.post({
        method: 'POST',
        url: url,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }, function (err, res, body) {
        if(typeof res.statusCode === 'undefined'){
            console.log('###########################Error############################');
            console.log(res);
            writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        }
        if (!err && res.statusCode === 201) {
            trackingJobsInserted.push({
                sourceJobId: job.jobId,
                sourceEmployerId: job.employerId
            });

            countInsertedJob ++;
            body = JSON.parse(body);
            console.timeEnd('addJobToSmartJob');
            console.log('Count %s | successful! new job id: %s belong to employer id %s',countInsertedJob, body.id, body.employer_id);

            console.log(body);
            process.exit();

            // remove index 0 from array
            sliceAndContinueAddJob();
        }else{
            console.log('Code %s', res.statusCode);
            console.log(body);
            writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        }
    });
}

function sliceAndContinueAddJob() {
    jobsJSON.splice(0, 1);
    addJobs();
}

module.exports = {
    addEplToSmartJobsBoard: function () {
        console.time('addEpmployerToSmartJob');
        schedulerAddUsers();
    },
    addJobsToJobBoard: function () {
        try{
            console.time('addJobToSmartJob');
            addJobs();
        }catch (ex){
            writeJSON(filePathTrackingJobsInserted, trackingJobsInserted, true);
        }
    }
};