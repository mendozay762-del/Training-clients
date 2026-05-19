import { WAIVER_VERSION } from "@/lib/schemas/client-intake";

export const WAIVER_TITLE = "Assumption of Risk and Release of Liability";

export type WaiverSection = {
  heading: string;
  body: string[];
};

export const WAIVER_SECTIONS: WaiverSection[] = [
  {
    heading: "1. Acknowledgment of the activity",
    body: [
      "I am voluntarily participating in personal training services. These services may include resistance training, cardiovascular exercise, mobility work, conditioning, general (non-medical) nutritional guidance, and related fitness instruction.",
    ],
  },
  {
    heading: "2. Assumption of risk",
    body: [
      "I understand that physical exercise carries inherent risks, including but not limited to: muscle strain, ligament or tendon injury, joint injury, fracture, cardiovascular events (including heart attack and stroke), heat-related illness, and in rare cases, death. I assume all such risks knowingly and voluntarily.",
    ],
  },
  {
    heading: "3. Representation of health",
    body: [
      "I represent that I have either consulted a physician regarding my participation in this exercise program, or have voluntarily chosen not to and accept full responsibility for that decision.",
      "I will inform the trainer immediately of any change in my health status, medications, injuries, or symptoms (including chest pain, dizziness, shortness of breath, joint pain, or unusual fatigue) before, during, or after any session.",
    ],
  },
  {
    heading: "4. Release of liability",
    body: [
      "In consideration of being permitted to participate, I release, waive, and discharge the trainer from any and all liability, claims, demands, actions, and causes of action arising out of any injury, illness, loss, or damage I may suffer in connection with the trainer's services, except where caused by the trainer's gross negligence or willful misconduct.",
    ],
  },
  {
    heading: "5. Scope of services",
    body: [
      "I acknowledge that the trainer is not a licensed medical professional, physical therapist, registered dietitian, or psychologist. The trainer's services do not constitute medical advice, diagnosis, treatment, prescription, physical therapy, or licensed dietary counseling. For any condition requiring such professional care, I will consult an appropriately licensed provider.",
    ],
  },
  {
    heading: "6. Records",
    body: [
      "I understand that the trainer may keep written records of my training sessions, measurements, goals, and communications for the purpose of providing services. These records will be kept confidential and not shared without my written permission, except as required by law.",
    ],
  },
  {
    heading: "7. Acknowledgment",
    body: [
      "I have read this entire document. I understand its terms. I have had the opportunity to ask questions. I accept these terms voluntarily by checking the box below and typing my full legal name.",
    ],
  },
];

export const WAIVER_DRAFT_NOTICE =
  "This waiver is a working draft pending attorney review. By accepting, you agree to its terms as written above; a finalized version may be re-signed later.";

export { WAIVER_VERSION };
