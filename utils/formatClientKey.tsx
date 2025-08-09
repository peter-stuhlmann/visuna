export type UserField = {
  label: string;
  inputType:
    | 'text'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'date'
    | 'select'
    | 'checkbox';
  options?: { label: string; value: string }[];
};

const formatUserKey = (key: string): UserField => {
  switch (key) {
    case 'name':
      return {
        label: 'Name',
        inputType: 'text',
      };
    case 'birthDate':
      return {
        label: 'Geburtsdatum',
        inputType: 'date',
      };
    case 'address':
      return {
        label: 'Adresse',
        inputType: 'text',
      };
    case 'phoneNumber':
      return {
        label: 'Telefonnummer',
        inputType: 'tel',
      };
    case 'email':
      return {
        label: 'E-Mail',
        inputType: 'email',
      };
    case 'gender':
      return {
        label: 'Geschlecht',
        inputType: 'select',
        options: [
          { label: '---', value: '-' },
          { label: 'Männlich', value: 'male' },
          { label: 'Weiblich', value: 'female' },
          { label: 'Divers', value: 'divers' },
        ],
      };
    case 'emergencyContactName':
      return {
        label: 'Notfallkontakt Name',
        inputType: 'text',
      };
    case 'emergencyContactPhone':
      return {
        label: 'Notfallkontakt Telefonnummer',
        inputType: 'tel',
      };
    case 'currentIllnesses':
      return {
        label: 'Aktuelle Erkrankungen',
        inputType: 'textarea',
      };
    case 'pastIllnesses':
      return {
        label: 'Chronische/Frühere Erkrankungen',
        inputType: 'textarea',
      };
    case 'allergies':
      return {
        label: 'Allergien',
        inputType: 'textarea',
      };
    case 'medications':
      return {
        label: '(Dauer-)Medikamente (inkl. Dosis und Einnahmezeitpunkt)',
        inputType: 'textarea',
      };
    case 'diet':
      return {
        label: 'Ernährungsgewohnheiten',
        inputType: 'textarea',
      };
    case 'alcoholConsumption':
      return {
        label: 'Alkoholkonsum',
        inputType: 'text',
      };
    case 'smoking':
      return {
        label: 'Tabakkonsum',
        inputType: 'text',
      };
    case 'exercise':
      return {
        label: 'Sport und Bewegung',
        inputType: 'text',
      };
    case 'stressLevel':
      return {
        label: 'Stresslevel',
        inputType: 'select',
        options: [
          { label: '---', value: '-' },
          { label: 'Gering', value: 'low' },
          { label: 'Mittel', value: 'medium' },
          { label: 'Hoch', value: 'high' },
        ],
      };
    case 'symptoms':
      return {
        label: 'Symptome, die zur Anfrage eine Infusionstherapie führen',
        inputType: 'textarea',
      };
    case 'painDetails':
      return {
        label: 'Schmerzen (Lokalisation, Charakter, Intensität)',
        inputType: 'textarea',
      };
    case 'sleep':
      return {
        label: 'Schlafhygiene',
        inputType: 'text',
      };
    case 'energyLevel':
      return {
        label: 'Energielevel',
        inputType: 'text',
      };
    case 'emotionalState':
      return {
        label: 'Emotionale Verfassung',
        inputType: 'text',
      };
    case 'pregnancy':
      return {
        label: 'Schwangerschaft',
        inputType: 'checkbox',
      };
    case 'breastfeeding':
      return {
        label: 'Stillzeit',
        inputType: 'checkbox',
      };
    case 'consentToTherapy':
      return {
        label: 'Einverständnis&shy;erklärung zur Infusionstherapie',
        inputType: 'checkbox',
      };
    case 'privacyPolicy':
      return {
        label: 'Datenschutzerklärung',
        inputType: 'checkbox',
      };
    case 'dataProcessingConsent':
      return {
        label: 'Einwilligung zur Datenverarbeitung für medizinische Zwecke',
        inputType: 'checkbox',
      };
    case 'clientId':
      return {
        label: 'ID',
        inputType: 'text',
      };
    case 'createdAt':
      return {
        label: 'Erstellt am',
        inputType: 'text',
      };
    case 'updatedAt':
      return {
        label: 'Zuletzt aktualisiert am',
        inputType: 'text',
      };
    case 'deletedAt':
      return {
        label: 'Gelöscht am',
        inputType: 'text',
      };
    case 'signature':
      return {
        label: 'Unterschrift',
        inputType: 'text',
      };
    // Weitere spezifische Schlüsselübersetzungen hinzufügen
    default:
      // Konvertiere z. B. "camelCase" in "Camel Case"
      return {
        label: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase()),
        inputType: 'text',
      };
  }
};

export default formatUserKey;
