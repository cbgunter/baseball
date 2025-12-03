// Mock data for development
const mockTerms = [
  // Scoring Plays
  { term: "Single", analogy: "A basic trip to the toilet", category: "Scoring Plays" },
  { term: "Double", analogy: "Two trips in quick succession (might want to see a doctor)", category: "Scoring Plays" },
  { term: "Triple", analogy: "Three trips in a short span (definitely see a doctor)", category: "Scoring Plays" },
  { term: "Home run", analogy: "When everything comes out perfectly in one go", category: "Scoring Plays" },
  { term: "Grand slam", analogy: "When the whole family needs to go at the exact same time (bases loaded chaos)", category: "Scoring Plays" },
  { term: "Inside-the-park home run", analogy: "Making it just in time without any stops", category: "Scoring Plays" },

  // Base Running
  { term: "Stealing bases", analogy: "When someone's taking too long and you sneak to another bathroom", category: "Base Running" },
  { term: "Caught stealing", analogy: "When you try to sneak to another bathroom but someone's already in there", category: "Base Running" },
  { term: "Bunt", analogy: "A quick, strategic pit stop", category: "Base Running" },
  { term: "Sacrifice fly", analogy: "Taking one for the team with a courtesy flush", category: "Base Running" },
  { term: "Walk", analogy: "When you take your sweet time getting there", category: "Base Running" },
  { term: "Intentional walk", analogy: "Deliberately waiting for a better bathroom to open up", category: "Base Running" },

  // On the Mound
  { term: "Strike out", analogy: "When you sit down three times but nothing happens", category: "On the Mound" },
  { term: "Perfect game", analogy: "No issues whatsoever, in and out, smooth operation", category: "On the Mound" },
  { term: "No-hitter", analogy: "When nothing happens despite your best efforts and concentration", category: "On the Mound" },
  { term: "Complete game", analogy: "Finishing the job without needing to return", category: "On the Mound" },
  { term: "Bullpen", analogy: "The backup bathroom", category: "On the Mound" },
  { term: "Relief pitcher", analogy: "Someone coming in to finish what you started (bringing toilet paper)", category: "On the Mound" },
  { term: "Closer", analogy: "The person who finally fixes the clogged toilet", category: "On the Mound" },

  // Positions & Equipment
  { term: "Pitcher's mound", analogy: "The throne itself", category: "Positions & Equipment" },
  { term: "Catcher", analogy: "The plunger (catching problems)", category: "Positions & Equipment" },
  { term: "First base", analogy: "The initial urge", category: "Positions & Equipment" },
  { term: "Dugout", analogy: "The stall you hide in during emergencies", category: "Positions & Equipment" },
  { term: "On deck circle", analogy: "Waiting anxiously right outside the door", category: "Positions & Equipment" },

  // Game Day
  { term: "Rain delay", analogy: "Plumbing issues cause an unexpected wait", category: "Game Day" },
  { term: "Extra innings", analogy: "When you thought you were done but need to go back for round two", category: "Game Day" },
  { term: "Seventh inning stretch", analogy: "The mid-day bathroom break", category: "Game Day" },
  { term: "Pinch hitter", analogy: "When you need backup (plunger required)", category: "Game Day" },
  { term: "Designated hitter", analogy: "The family member who always gets to use the main bathroom", category: "Game Day" },
  { term: "Ejection", analogy: "When someone kicks you out for taking too long", category: "Game Day" },

  // Plays & Calls
  { term: "Foul ball", analogy: "When things don't go quite right (missed the bowl)", category: "Plays & Calls" },
  { term: "Fair ball", analogy: "Everything lands where it should", category: "Plays & Calls" },
  { term: "Error", analogy: "An obvious mistake (forgot to flush)", category: "Plays & Calls" },
  { term: "Double play", analogy: "Two people done in rapid succession (efficient household)", category: "Plays & Calls" },
  { term: "Strikeout looking", analogy: "False alarm, didn't actually need to go", category: "Plays & Calls" },

  // The Stat Sheet
  { term: "Batting average", analogy: "Your daily success rate", category: "The Stat Sheet" },
  { term: "ERA (Emergency Relief Average)", analogy: "How often you make it in time", category: "The Stat Sheet" },
  { term: "RBI (Runs Bathed In)", analogy: "The quality of your shower afterward", category: "The Stat Sheet" },
  { term: "Save", analogy: "Successfully preventing a disaster", category: "The Stat Sheet" },
  { term: "Rookie", analogy: "Someone potty training", category: "The Stat Sheet" }
];

// API Client
const API_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK_DATA = !import.meta.env.VITE_API_URL || import.meta.env.DEV;

export const api = {
  // Get all approved terms
  async getTerms() {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockTerms;
    }

    try {
      const response = await fetch(`${API_URL}/terms`);
      if (!response.ok) throw new Error('Failed to fetch terms');
      return await response.json();
    } catch (error) {
      console.error('Error fetching terms:', error);
      throw error;
    }
  },

  // Submit a new term
  async submitTerm(termData) {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Mock submission:', termData);
      return { success: true, message: 'Term submitted successfully' };
    }

    try {
      const response = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(termData)
      });

      if (!response.ok) throw new Error('Failed to submit term');
      return await response.json();
    } catch (error) {
      console.error('Error submitting term:', error);
      throw error;
    }
  }
};
