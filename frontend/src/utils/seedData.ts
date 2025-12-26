import { collection, addDoc, getDocs, query, where, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// This script seeds the database with 10 test listings
// The listings will be associated with user jonas_oesch@hotmail.com
export const seedTestData = async () => {
  try {
    // First, ensure the test user exists in Firestore
    // We need to use a known user ID. In Firebase, we'll use a consistent ID for this user.
    const testUserEmail = 'jonas_oesch@hotmail.com';
    
    // Check if listings already exist
    const existingQuery = query(
      collection(db, 'inserate'),
      where('title', '==', 'Shimano Angelrute Twin Power XD 2.70m')
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (existingDocs.size > 0) {
      console.log('Test data already exists. Skipping seed.');
      return { success: true, message: 'Test data already exists' };
    }

    // For the seed, we'll create a predictable user ID based on the email
    // In a real scenario, this would be the actual Firebase Auth UID
    const testUserId = 'seed-user-jonas-oesch';
    
    // Create/update the user document if it doesn't exist
    const userRef = doc(db, 'users', testUserId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: testUserEmail,
        name: 'Jonas Oesch',
        phone: null,
        location: 'Schweiz',
        profileImage: null,
        createdAt: Timestamp.now(),
      });
      console.log('Created test user: Jonas Oesch');
    }
    
    const testInserate = [
      {
        title: 'Shimano Angelrute Twin Power XD 2.70m',
        description: 'Hochwertige Spinnrute von Shimano in sehr gutem Zustand. Perfekt für Raubfischangeln. Wurfgewicht 10-30g. Nur wenige Male benutzt.',
        price: 189.90,
        category: 'Ruten',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Bern',
        zipCode: '3000',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Daiwa BG 4000 Rolle - Fast neu!',
        description: 'Kaum benutzte Stationärrolle von Daiwa. Sehr robust und zuverlässig. Ideal für Salzwasser. Mit Originalverpackung.',
        price: 120.00,
        category: 'Rollen',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Zürich',
        zipCode: '8000',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Set Gummifische und Jigköpfe',
        description: '20 verschiedene Gummifische in diversen Farben und Größen plus 15 Jigköpfe. Perfektes Starter-Set für Hechtangeln.',
        price: 45.50,
        category: 'Köder',
        condition: 'Neu' as const,
        images: [],
        location: 'Luzern',
        zipCode: '6000',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Tackle Box mit Zubehör',
        description: 'Große Angelbox gefüllt mit verschiedenem Zubehör: Haken, Wirbel, Schnüre, Bleie, etc. Alles was man braucht!',
        price: 65.00,
        category: 'Zubehör',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Basel',
        zipCode: '4000',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Wathose Gr. L - Atmungsaktiv',
        description: 'Atmungsaktive Wathose von Guideline in Größe L. In sehr gutem Zustand, keine Löcher. Mit Neoprensocken.',
        price: 150.00,
        category: 'Kleidung',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'St. Gallen',
        zipCode: '9000',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Selbstgebauter Wobbler Set (5 Stück)',
        description: 'Selbst gebaute und bemalte Wobbler. Jeder ein Unikat! Funktionieren einwandfrei und fangen gut. Verschiedene Farben.',
        price: 30.00,
        category: 'Köder',
        condition: 'Selbst gebastelt' as const,
        images: [],
        location: 'Winterthur',
        zipCode: '8400',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Penn Spinfisher VI 2500 - Neuwertig',
        description: 'Top Salzwasserrolle von Penn. Wurde nur 2x benutzt. Mit Extra-Spule. Absolut wie neu!',
        price: 175.00,
        category: 'Rollen',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Genf',
        zipCode: '1200',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Kescher mit Teleskopstiel',
        description: 'Großer Kescher mit ausziehbarem Teleskopstiel bis 3m. Gummiertes Netz, schonend für Fische.',
        price: 55.00,
        category: 'Zubehör',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Thun',
        zipCode: '3600',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Fliegenrute 9ft #5 + Rolle',
        description: 'Komplettes Fliegenfischer-Set: 4-teilige Rute 9ft Klasse 5 plus passende Rolle mit Schnur. Ideal für Forellen.',
        price: 220.00,
        category: 'Ruten',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Fribourg',
        zipCode: '1700',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        title: 'Angelkoffer auf Rädern',
        description: 'Praktischer Angelkoffer mit Rollen und ausziehbarem Griff. Viel Stauraum für Ruten und Zubehör. Sehr stabil.',
        price: 85.00,
        category: 'Sonstiges',
        condition: 'Gebraucht' as const,
        images: [],
        location: 'Lausanne',
        zipCode: '1000',
        status: 'Aktiv' as const,
        userId: testUserId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    console.log('Seeding database with test data...');
    
    for (const inserat of testInserate) {
      await addDoc(collection(db, 'inserate'), inserat);
      console.log(`Added: ${inserat.title}`);
    }
    
    console.log('✅ Successfully seeded 10 test listings!');
    return { success: true, message: 'Successfully seeded 10 test listings' };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, message: `Error: ${error}` };
  }
};
