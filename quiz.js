// Recommendation Quiz Module
import { products } from "./products.js";

export const quizQuestions = [
  {
    id: "room",
    text: "तुम्ही कोणत्या प्रकारची जागा डिझाईन करत आहात? (What environment are you designing?)",
    options: [
      { value: "office", label: "होम ऑफिस (Home Office)", desc: "उत्कृष्ट काम, कोडिंग आणि आरामासाठी (For work, coding, & comfort)", icon: "💼" },
      { value: "living", label: "दिवाणखाना (Living Room)", desc: "चित्रपट, मनोरंजन आणि पाहुण्यांच्या स्वागतासाठी (For relaxation & cinema)", icon: "🛋️" }
    ]
  },
  {
    id: "style",
    text: "तुमची आवडती डिझाईन शैली निवडा: (Select your aesthetic:)",
    options: [
      { value: "warm", label: "वॉर्म क्राफ्ट (Warm Wood & Fabrics)", desc: "नैसर्गिक लाकूड, मऊ कापड आणि उबदार रंग (Natural woods & cozy textures)", icon: "🪵" },
      { value: "cyber", label: "स्लीक टेक (Sleek Tech & Aluminum)", desc: "मेटल फिनिश, डार्क मोड आणि आरजीबी लाईट्स (Minimalist metal & RGB lights)", icon: "💻" }
    ]
  },
  {
    id: "priority",
    text: "तुमची मुख्य प्राथमिकता काय आहे? (What is your top priority?)",
    options: [
      { value: "comfort", label: "आराम आणि आरोग्य (Ergonomics & Comfort)", desc: "दीर्घकाळ बसण्यासाठी आणि आरोग्यासाठी (Long hours support)", icon: "🧘" },
      { value: "performance", label: "कार्यक्षमता आणि मीडिया (Performance & Media)", desc: "वेगवान स्पीड आणि उत्कृष्ट आवाज/चित्र (High-speed & crisp AV)", icon: "⚡" }
    ]
  },
  {
    id: "budget",
    text: "तुमचे एकूण बजेट किती आहे? (What is your total budget?)",
    options: [
      { value: "budget", label: "बजेट खरेदी (Budget < ₹50,000)", desc: "मूलभूत आणि दर्जेदार वस्तू (Essential premium pieces)", icon: "🏷️" },
      { value: "mid", label: "मध्यम श्रेणी (Mid-Tier ₹50,000 - ₹1,50,000)", desc: "उच्च दर्जा आणि आधुनिक वैशिष्ट्ये (High quality & modern)", icon: "✨" },
      { value: "high", label: "अल्टीमेट लक्झरी (Ultimate ₹1,50,000+)", desc: "सर्वोत्कृष्ट आणि संपूर्ण सेटअप (No compromises, full set)", icon: "👑" }
    ]
  }
];

export function calculateRecommendations(answers) {
  let scoreMap = new Map();

  products.forEach(product => {
    let score = 0;

    // Room Matching
    if (answers.room === "office") {
      if (product.id === "standing-desk" || product.id === "curved-monitor" || product.id === "mechanical-keyboard") {
        score += 4;
      }
      if (product.id === "lounge-chair" || product.id === "studio-headphones") {
        score += 2;
      }
    } else if (answers.room === "living") {
      if (product.id === "sectional-sofa" || product.id === "dining-table" || product.id === "smart-projector") {
        score += 4;
      }
      if (product.id === "studio-headphones" || product.id === "lounge-chair") {
        score += 2;
      }
    }

    // Aesthetic Style Matching
    if (answers.style === "warm") {
      if (product.category === "furniture") {
        score += 3;
      }
      if (product.id === "mechanical-keyboard") {
        // Retro keyboard matches warm style
        score += 1.5;
      }
    } else if (answers.style === "cyber") {
      if (product.category === "electronics") {
        score += 3;
      }
      if (product.id === "standing-desk") {
        // standing desk has clean frames
        score += 1.5;
      }
    }

    // Priority Matching
    if (answers.priority === "comfort") {
      if (product.id === "lounge-chair" || product.id === "sectional-sofa") {
        score += 4;
      }
      if (product.id === "standing-desk") {
        score += 3;
      }
      if (product.id === "studio-headphones") {
        score += 1.5;
      }
    } else if (answers.priority === "performance") {
      if (product.id === "curved-monitor" || product.id === "smart-projector") {
        score += 4;
      }
      if (product.id === "mechanical-keyboard" || product.id === "studio-headphones") {
        score += 2.5;
      }
    }

    scoreMap.set(product.id, score);
  });

  // Sort products based on scores
  const sortedProducts = [...products]
    .map(p => ({ ...p, score: scoreMap.get(p.id) }))
    .sort((a, b) => b.score - a.score);

  // Budget Filtering
  let maxBudget = Infinity;
  if (answers.budget === "budget") maxBudget = 50000;
  else if (answers.budget === "mid") maxBudget = 150000;

  // Let's create a combined recommendation list
  // Find top items that fit within the budget
  let selectedItems = [];
  let currentCost = 0;

  for (const item of sortedProducts) {
    if (currentCost + item.price <= maxBudget) {
      selectedItems.push(item);
      currentCost += item.price;
    }
  }

  // Fallback: If no item can fit, return the single highest scoring item
  if (selectedItems.length === 0) {
    selectedItems.push(sortedProducts[0]);
  }

  return {
    packageTitle: getPackageTitle(answers),
    items: selectedItems,
    totalPrice: selectedItems.reduce((sum, item) => sum + item.price, 0),
    description: getPackageDescription(answers)
  };
}

function getPackageTitle(answers) {
  if (answers.room === "office") {
    if (answers.style === "warm") return "The Artisan Workspace";
    return "The Cyberpunk Command Center";
  } else {
    if (answers.style === "warm") return "The Scandinavian Lounge";
    return "The Smart Home Cinema Haven";
  }
}

function getPackageDescription(answers) {
  if (answers.room === "office") {
    if (answers.style === "warm") {
      return "A cozy and ergonomic workstation combining natural wood furniture with warm retro accessories. Designed to support focused creative flow and long writing hours.";
    }
    return "A high-performance setup with ultra-wide display, mechanical keyboard, and precision aesthetics. Designed for developers, designers, and tech enthusiasts who love clean dark setups.";
  } else {
    if (answers.style === "warm") {
      return "A deeply relaxing room layout focusing on soft fabrics, tactile furniture, and intimate lighting. Designed to be a serene sanctuary for reads and warm conversation.";
    }
    return "An immersive home entertainment oasis with projection cinema, high-fidelity acoustics, and premium modular lounge seating. Ideal for movies, sports, and media enthusiasts.";
  }
}
