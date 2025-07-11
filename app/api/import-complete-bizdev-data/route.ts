import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Function to convert original rating format to new detailed format
function convertRatingData(oldRatings: any) {
  if (!oldRatings || typeof oldRatings !== 'object' || Object.keys(oldRatings).length === 0) {
    // Return default ratings for projects without detailed ratings
    return {
      revenuePotential: { value: 3, weight: 0.2 },
      insiderSupport: { value: 3, weight: 0.15 },
      strategicFitEvolve: { value: 3, weight: 0.2 },
      strategicFitVerticals: { value: 3, weight: 0.1 },
      clarityClient: { value: 3, weight: 0.1 },
      clarityUs: { value: 3, weight: 0.1 },
      effortPotentialClient: { value: 3, weight: 0.1 },
      effortExistingClient: { value: 3, weight: 0.05 },
      timingPotentialClient: { value: 3, weight: 0.05 },
      runway: 6
    }
  }

  // Convert old simple format to new detailed format
  return {
    revenuePotential: { 
      value: oldRatings.revenue_potential || 3, 
      weight: 0.2 
    },
    insiderSupport: { 
      value: oldRatings.insider_support || 3, 
      weight: 0.15 
    },
    strategicFitEvolve: { 
      value: oldRatings.strategic_fit || 3, 
      weight: 0.2 
    },
    strategicFitVerticals: { 
      value: oldRatings.strategic_fit || 3, 
      weight: 0.1 
    },
    clarityClient: { 
      value: oldRatings.stability_clarity || 3, 
      weight: 0.1 
    },
    clarityUs: { 
      value: oldRatings.stability_clarity || 3, 
      weight: 0.1 
    },
    effortPotentialClient: { 
      value: oldRatings.effort || 3, 
      weight: 0.1 
    },
    effortExistingClient: { 
      value: oldRatings.effort || 3, 
      weight: 0.05 
    },
    timingPotentialClient: { 
      value: oldRatings.timing || 3, 
      weight: 0.05 
    },
    runway: Math.floor((oldRatings.timing || 3) * 3) // Convert timing to runway months
  }
}

// Original projects data
const originalProjects = [
  {"id": "1d8b855c-c495-4720-a80e-822d937b8967", "created_at": "2025-05-15 16:33:28.210434+00", "user_id": null, "name": "Apollo", "description": "", "rating": "4.66", "priority": "medium", "status": "active", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 5, "strategic_fit": 5, "insider_support": 4, "revenue_potential": 5, "stability_clarity": 4}},
  {"id": "73a6f4ab-ef86-4f50-9b83-1c403d4a9e84", "created_at": "2025-05-15 16:33:47.315125+00", "user_id": null, "name": "ASC", "description": "", "rating": "4.08", "priority": "medium", "status": "active", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 5, "strategic_fit": 5, "insider_support": 4, "revenue_potential": 3, "stability_clarity": 4}},
  {"id": "d6a67f8b-396e-4af7-9793-f994ef6d522a", "created_at": "2025-05-15 16:34:01.679908+00", "user_id": null, "name": "Built", "description": "", "rating": "3.9", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 4, "strategic_fit": 4, "insider_support": 3, "revenue_potential": 4, "stability_clarity": 3}},
  {"id": "00a55476-ca47-4d7c-a208-9160e0a8a44b", "created_at": "2025-05-15 16:34:21.752922+00", "user_id": null, "name": "Mede", "description": "", "rating": "3.79", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 5, "strategic_fit": 3, "insider_support": 4, "revenue_potential": 4, "stability_clarity": 3}},
  {"id": "c49ef0ab-0a14-4b1f-97af-8cf9dceb846f", "created_at": "2025-05-15 16:34:36.899392+00", "user_id": null, "name": "E-card Systems", "description": "", "rating": "3.23", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 4, "strategic_fit": 3, "insider_support": 4, "revenue_potential": 2, "stability_clarity": 5}},
  {"id": "89f44833-30c4-4215-ac7e-23361b686f8b", "created_at": "2025-05-15 16:34:48.42021+00", "user_id": null, "name": "Subpop", "description": "", "rating": "3.67", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 4, "strategic_fit": 4, "insider_support": 4, "revenue_potential": 3, "stability_clarity": 4}},
  {"id": "b62429c7-164c-47c2-bb75-ed8679bf511e", "created_at": "2025-05-15 16:35:01.781306+00", "user_id": null, "name": "LP3 Solution", "description": "", "rating": "3.18", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 5, "strategic_fit": 2, "insider_support": 4, "revenue_potential": 2, "stability_clarity": 4}},
  {"id": "9903ed36-8eaf-4d22-b322-b3c7f2f7b58d", "created_at": "2025-05-15 16:35:13.087758+00", "user_id": null, "name": "IVX", "description": "", "rating": "2.48", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 1, "strategic_fit": 5, "insider_support": 4, "revenue_potential": 1, "stability_clarity": 3}},
  {"id": "75a3f7ad-2309-4148-afb5-c41b26d01b46", "created_at": "2025-05-15 16:35:25.641716+00", "user_id": null, "name": "Next Street", "description": "", "rating": "2.84", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 3, "strategic_fit": 2, "insider_support": 3, "revenue_potential": 3, "stability_clarity": 3}},
  {"id": "f04b57dc-a634-496d-aa46-5b69630eb507", "created_at": "2025-05-15 16:35:38.739464+00", "user_id": null, "name": "Mastery Logistic", "description": "", "rating": "1.87", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 0, "strategic_fit": 3, "insider_support": 1, "revenue_potential": 2, "stability_clarity": 2}},
  {"id": "9d8d0929-fbe9-4b21-b465-c4f634197aff", "created_at": "2025-05-15 16:36:31.868875+00", "user_id": null, "name": "CTO club", "description": "", "rating": "3", "priority": "high", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "e1ca002e-35e0-4f4a-9014-0ee087bc17c5", "created_at": "2025-05-15 16:36:45.48948+00", "user_id": null, "name": "Events", "description": "", "rating": "3", "priority": "high", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "be05e987-1306-4545-be44-a07dff61fb43", "created_at": "2025-05-16 14:45:00.709123+00", "user_id": null, "name": "Research that support biz dev", "description": "Biz Dev Strategies\\nSources\\n-PE\\n-Advisors (Satyan)\\n-Current Clients\\n-Current Client Referrals\\n-75% People/Introducers (Schlegel, Simpson)\\n\\nOrg/Materials", "rating": "3", "priority": "medium", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "71d17e44-1efd-48f7-937a-2163c74bf623", "created_at": "2025-05-16 14:53:48.392431+00", "user_id": null, "name": "Big Questions", "description": "Scale\\nInfuse AI/AI Consulting\\nEvolve our Services\\nStart New Businesses\\n", "rating": "3", "priority": "medium", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "70a4c1ea-192d-47c9-a48e-f789e8d0d749", "created_at": "2025-05-22 10:53:49.196781+00", "user_id": null, "name": "Schlegel", "description": "", "rating": "3", "priority": "medium", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "b44e8649-f3d7-4466-b3ca-37b8de1ec6e8", "created_at": "2025-05-23 16:31:55.51338+00", "user_id": null, "name": "Kareem Saleh Project", "description": "", "rating": "3.29", "priority": "high", "status": "active", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 5, "strategic_fit": 3, "insider_support": 4, "revenue_potential": 2, "stability_clarity": 3}},
  {"id": "819c944a-672e-453b-a158-ebfd8346ad99", "created_at": "2025-05-31 21:52:51.952364+00", "user_id": null, "name": "WEX", "description": "", "rating": "3.57", "priority": "high", "status": "active", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 3, "strategic_fit": 4, "insider_support": 3, "revenue_potential": 4, "stability_clarity": 3}},
  {"id": "f17685df-e0b5-436f-b4e3-921be495a7a0", "created_at": "2025-05-31 21:55:18.465386+00", "user_id": null, "name": "George Uribe (guest booker)", "description": "", "rating": "0", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {}},
  {"id": "61183699-bcd0-49df-ac47-70dcb3cdc64d", "created_at": "2025-05-31 21:55:41.301678+00", "user_id": null, "name": "Matt Cybulsky", "description": "", "rating": "2.51", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 3, "strategic_fit": 2, "insider_support": 4, "revenue_potential": 2, "stability_clarity": 2}},
  {"id": "772d858d-9c2f-457a-aff0-d5f1060a9682", "created_at": "2025-06-03 16:41:03.016515+00", "user_id": null, "name": "article summarizer", "description": "", "rating": "3", "priority": "low", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "6ccc6a9e-04b6-423a-86e8-6c1fc1739b12", "created_at": "2025-06-03 16:42:16.720442+00", "user_id": null, "name": "sourcing and research", "description": "", "rating": "3", "priority": "medium", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "c5c71896-e9ac-4888-95f8-6d793366f193", "created_at": "2025-06-09 19:12:20.991728+00", "user_id": null, "name": "Grace Hanson contract", "description": "", "rating": "3.29", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 4, "strategic_fit": 5, "insider_support": 4, "revenue_potential": 2, "stability_clarity": 3}},
  {"id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "created_at": "2025-06-12 09:55:44.494939+00", "user_id": null, "name": "Product event 25.6", "description": "", "rating": "3", "priority": "high", "status": "active", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "5e0a2e54-21ce-4cd3-80ac-0f9b8ed896a5", "created_at": "2025-06-12 10:31:51.159688+00", "user_id": null, "name": "Black and decker", "description": "", "rating": "3.56", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 3, "strategic_fit": 4, "insider_support": 2, "revenue_potential": 5, "stability_clarity": 2}},
  {"id": "c8501531-c7eb-4fc8-9eff-ce700bbde11b", "created_at": "2025-06-12 10:32:10.172658+00", "user_id": null, "name": "Steeltoe", "description": "", "rating": "3.46", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 4, "strategic_fit": 4, "insider_support": 3, "revenue_potential": 3, "stability_clarity": 4}},
  {"id": "4ef17276-e198-49e9-a656-74c4fdd9dc0b", "created_at": "2025-06-12 10:32:52.004333+00", "user_id": null, "name": "JLL Partners", "description": "", "rating": "3.3", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 4, "strategic_fit": 5, "insider_support": 4, "revenue_potential": 2, "stability_clarity": 3}},
  {"id": "4a68cc50-8ed0-4724-8d1d-36e21e4470ac", "created_at": "2025-06-12 10:33:26.080237+00", "user_id": null, "name": "AWS for Built", "description": "", "rating": "3.29", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 3, "strategic_fit": 4, "insider_support": 4, "revenue_potential": 3, "stability_clarity": 3}},
  {"id": "9ae03688-9e04-4cef-b133-0033b0db33b1", "created_at": "2025-06-12 10:34:00.335665+00", "user_id": null, "name": "HealthStream", "description": "", "rating": "3.2", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 4, "strategic_fit": 4, "insider_support": 3, "revenue_potential": 3, "stability_clarity": 2}},
  {"id": "df748566-66fc-462a-9951-e162873edf98", "created_at": "2025-06-12 10:34:26.57412+00", "user_id": null, "name": "Back None", "description": "", "rating": "2.97", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 3, "timing": 3, "strategic_fit": 2, "insider_support": 4, "revenue_potential": 3, "stability_clarity": 3}},
  {"id": "a255fcde-b45b-4a81-b4f1-caf190f72796", "created_at": "2025-06-12 10:34:53.601951+00", "user_id": null, "name": "BrainTrust", "description": "", "rating": "2.56", "priority": "medium", "status": "potential", "is_ian_collaboration": false, "detailed_ratings_data": {"effort": 4, "timing": 4, "strategic_fit": 2, "insider_support": 4, "revenue_potential": 1, "stability_clarity": 3}},
  {"id": "270de7c6-c1ed-475d-b8f9-4b783d8c6b05", "created_at": "2025-06-13 16:27:15.643062+00", "user_id": null, "name": "AWS certefication", "description": "", "rating": "3", "priority": "medium", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "150c28c3-3ad1-4942-9849-9ab42c64a88b", "created_at": "2025-06-17 16:49:04.224421+00", "user_id": null, "name": "source 300 hundred more product ppl by august 30", "description": "", "rating": "3", "priority": "medium", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}},
  {"id": "f5cd13a0-fc4e-4e32-b0d2-fdfb01a27f4e", "created_at": "2025-06-23 09:49:47.592549+00", "user_id": null, "name": "VIP Personas management", "description": "", "rating": "3", "priority": "high", "status": "potential", "is_ian_collaboration": true, "detailed_ratings_data": {}}
]

// Original tasks data
const originalTasks = [
  {"id": "47bd9d18-4629-4a73-be04-4a7cbe460578", "created_at": "2025-05-19 11:39:20.48679+00", "project_id": "71d17e44-1efd-48f7-937a-2163c74bf623", "user_id": null, "text": "Scale", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "3f988294-3351-4965-805f-67b76040f833", "created_at": "2025-05-19 11:39:29.252098+00", "project_id": "71d17e44-1efd-48f7-937a-2163c74bf623", "user_id": null, "text": "Infuse AI/AI Consulting", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "392999ff-cfd2-458a-8071-5299c50262db", "created_at": "2025-05-19 11:39:35.760308+00", "project_id": "71d17e44-1efd-48f7-937a-2163c74bf623", "user_id": null, "text": "Evolve our Services", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "1f2d532a-5823-4abb-ab36-ac77433643cd", "created_at": "2025-05-19 11:39:41.881732+00", "project_id": "71d17e44-1efd-48f7-937a-2163c74bf623", "user_id": null, "text": "Start New Businesses", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "d614b790-70a4-416e-848d-b4f87a1b0663", "created_at": "2025-05-19 11:40:00.652434+00", "project_id": "be05e987-1306-4545-be44-a07dff61fb43", "user_id": null, "text": "Automation of some tasks", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "e4480a6c-a178-4d0c-8f14-f6318b5b316e", "created_at": "2025-05-19 11:40:22.924869+00", "project_id": "be05e987-1306-4545-be44-a07dff61fb43", "user_id": null, "text": "Transcripts - organizing and increasing quality of summaries", "completed": false, "parent_task_id": "d614b790-70a4-416e-848d-b4f87a1b0663", "order": null, "status": "todo"},
  {"id": "8853d7d7-53f5-43f2-8ea9-7605841ae921", "created_at": "2025-05-19 11:40:36.161779+00", "project_id": "be05e987-1306-4545-be44-a07dff61fb43", "user_id": null, "text": "PE, Venture Studio, and Advisor relationships", "completed": false, "parent_task_id": "d614b790-70a4-416e-848d-b4f87a1b0663", "order": null, "status": "todo"},
  {"id": "18edc9d0-9654-404e-baea-aba6b813a608", "created_at": "2025-05-19 11:40:45.594996+00", "project_id": "be05e987-1306-4545-be44-a07dff61fb43", "user_id": null, "text": "Potential Projects", "completed": false, "parent_task_id": "d614b790-70a4-416e-848d-b4f87a1b0663", "order": null, "status": "todo"},
  {"id": "2f030c63-09da-45e3-9d25-5e3a856a404c", "created_at": "2025-05-19 11:40:55.126197+00", "project_id": "be05e987-1306-4545-be44-a07dff61fb43", "user_id": null, "text": "Library of Biz Dev content", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "40b2cca6-90f4-45ab-9b86-038375e572fa", "created_at": "2025-05-31 21:58:11.478084+00", "project_id": "b44e8649-f3d7-4466-b3ca-37b8de1ec6e8", "user_id": null, "text": "on vacation until 6.9", "completed": true, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "ef209273-91b2-427e-8948-f202fba3ae08", "created_at": "2025-06-12 09:56:20.268614+00", "project_id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "user_id": null, "text": "send email to Zap", "completed": true, "parent_task_id": null, "order": null, "status": "done"},
  {"id": "c07be54c-c799-4f75-b054-4329f63919fa", "created_at": "2025-06-12 09:56:39.388422+00", "project_id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "user_id": null, "text": "Find emails for existing guestlist", "completed": false, "parent_task_id": null, "order": null, "status": "done"},
  {"id": "d1b1142b-2211-49cd-b88b-5ef000144474", "created_at": "2025-06-12 09:57:14.376274+00", "project_id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "user_id": null, "text": "Source new guests with contact information", "completed": false, "parent_task_id": null, "order": null, "status": "done"},
  {"id": "81687c17-5bec-4e8d-b704-0ca89e97e7b6", "created_at": "2025-06-12 09:57:50.605408+00", "project_id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "user_id": null, "text": "research guestlists and target several Target Guest for Josh to network on the event", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "f13b5928-311f-4427-8052-c0177adc3b22", "created_at": "2025-06-12 09:58:27.286316+00", "project_id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "user_id": null, "text": "Debrief after event", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "bcdbb281-08cc-4cc7-b094-ad2681425430", "created_at": "2025-06-12 09:58:47.423492+00", "project_id": "f586fc45-79d0-42d2-90a2-e082cbe5ac6c", "user_id": null, "text": "create and execute follow up strategy post event", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "ca3f6c5d-2911-4783-b037-39353bd39916", "created_at": "2025-06-13 16:35:39.84756+00", "project_id": "270de7c6-c1ed-475d-b8f9-4b783d8c6b05", "user_id": null, "text": "List certifications/documentation needed", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "5f96532d-efd1-4154-bf49-febbd1b7cf46", "created_at": "2025-06-13 16:35:51.508959+00", "project_id": "270de7c6-c1ed-475d-b8f9-4b783d8c6b05", "user_id": null, "text": "Understand cert process before August", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "f1dcc7e9-c487-42e4-85c1-a427c7682d72", "created_at": "2025-06-13 18:05:22.13613+00", "project_id": "270de7c6-c1ed-475d-b8f9-4b783d8c6b05", "user_id": null, "text": "Investigate lowest-level AWS partner tier", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "63bed5c7-b4d1-4337-bbba-7edcb7b1231b", "created_at": "2025-06-13 18:05:51.547407+00", "project_id": "70a4c1ea-192d-47c9-a48e-f789e8d0d749", "user_id": null, "text": "Track Schlaggel/Built Projects", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "76b918dc-65bf-414f-a643-4ad6324a1dc7", "created_at": "2025-06-13 18:07:42.813758+00", "project_id": "70a4c1ea-192d-47c9-a48e-f789e8d0d749", "user_id": null, "text": "Request detailed summary of Schlaggel call from Ashley", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "97d88737-2923-4b21-ae4b-4c88eb39a3cb", "created_at": "2025-06-13 18:07:52.967391+00", "project_id": "70a4c1ea-192d-47c9-a48e-f789e8d0d749", "user_id": null, "text": "Build a brief tracking system for Joshua's Schlaggel-related commitments", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "6f728f1f-fb7c-484e-91c2-edc9640ee6d3", "created_at": "2025-06-13 18:08:09.245765+00", "project_id": "70a4c1ea-192d-47c9-a48e-f789e8d0d749", "user_id": null, "text": "Joshua's task list for Educators Cooperative", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "908c9e48-b653-4987-bcc1-4cd2f7ceca2c", "created_at": "2025-06-23 09:18:14.398988+00", "project_id": "9d8d0929-fbe9-4b21-b465-c4f634197aff", "user_id": null, "text": "Refine \"Ideal Member Profile\" & Target Company List", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "ed314040-1860-4cb5-ada7-907d8e262c42", "created_at": "2025-06-23 09:21:07.521549+00", "project_id": "9d8d0929-fbe9-4b21-b465-c4f634197aff", "user_id": null, "text": "Create Target Company & Individual List", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "b5b55364-73d6-479b-8b3f-f4095576b738", "created_at": "2025-06-23 09:39:31.64047+00", "project_id": "9d8d0929-fbe9-4b21-b465-c4f634197aff", "user_id": null, "text": "Data Consolidation & Organization", "completed": false, "parent_task_id": null, "order": null, "status": "done"},
  {"id": "a1e4987b-f405-4454-bc97-efafcfc4714f", "created_at": "2025-06-23 09:40:16.977302+00", "project_id": "9d8d0929-fbe9-4b21-b465-c4f634197aff", "user_id": null, "text": "Draft \"Member Acquisition & Outreach Strategy\"", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "8a3100ae-0e34-498e-ba09-590a83487190", "created_at": "2025-06-23 09:44:00.33686+00", "project_id": "e1ca002e-35e0-4f4a-9014-0ee087bc17c5", "user_id": null, "text": "Define Target Personas", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "20408b98-c15c-4c89-8cdf-f661359d3eb2", "created_at": "2025-06-23 09:44:27.763994+00", "project_id": "e1ca002e-35e0-4f4a-9014-0ee087bc17c5", "user_id": null, "text": "Establish Data Management System", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "50dc7232-6eb0-4416-8720-fd6dbbeeebaa", "created_at": "2025-06-23 09:44:47.852076+00", "project_id": "e1ca002e-35e0-4f4a-9014-0ee087bc17c5", "user_id": null, "text": "Develop Comprehensive Follow-Up Strategy", "completed": false, "parent_task_id": null, "order": null, "status": "waiting"},
  {"id": "a96190fc-8cab-4352-9421-2536fdd8f3ab", "created_at": "2025-06-23 09:45:05.395942+00", "project_id": "e1ca002e-35e0-4f4a-9014-0ee087bc17c5", "user_id": null, "text": "Post-Event Debrief Process", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "d1f44f51-a522-4d4a-b873-5982334f9f44", "created_at": "2025-06-23 09:45:37.339387+00", "project_id": "e1ca002e-35e0-4f4a-9014-0ee087bc17c5", "user_id": null, "text": "Draft Annual Event Calendar", "completed": false, "parent_task_id": null, "order": null, "status": "todo"},
  {"id": "91f1ccf7-8999-4648-8007-dcf0c2543b48", "created_at": "2025-06-23 09:50:08.856958+00", "project_id": "f5cd13a0-fc4e-4e32-b0d2-fdfb01a27f4e", "user_id": null, "text": "VIP Tracking System: Outline System Requirements", "completed": false, "parent_task_id": null, "order": null, "status": "done"},
  {"id": "770c22ab-b326-4876-8b19-8a26690419c0", "created_at": "2025-06-23 09:50:25.748425+00", "project_id": "f5cd13a0-fc4e-4e32-b0d2-fdfb01a27f4e", "user_id": null, "text": "VIP Profiles (Schlegel Pilot): Gather All Info on Thomas Schlegel", "completed": false, "parent_task_id": null, "order": null, "status": "doing"},
  {"id": "0410f285-3e01-4cbf-a156-cd954a1fa2e4", "created_at": "2025-06-23 09:50:53.908038+00", "project_id": "f5cd13a0-fc4e-4e32-b0d2-fdfb01a27f4e", "user_id": null, "text": "VIP Profiles (Schlegel Pilot): Draft Schlegel Profile & Goal Map v0.1 (in system)", "completed": false, "parent_task_id": null, "order": null, "status": "todo"}
]

export async function POST() {
  try {
    console.log('Starting to import complete BizDev data...')
    
    // Transform and insert projects
    const transformedProjects = originalProjects.map(project => ({
      id: project.id,
      created_at: project.created_at,
      user_id: project.user_id,
      name: project.name,
      description: project.description,
      rating: parseFloat(project.rating || '0'),
      priority: project.priority,
      status: project.status,
      is_ian_collaboration: project.is_ian_collaboration,
      detailed_ratings_data: convertRatingData(project.detailed_ratings_data)
    }))

    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .insert(transformedProjects)
      .select()

    if (projectError) {
      console.error('Error inserting projects:', projectError)
      return NextResponse.json({ 
        error: 'Failed to insert projects', 
        details: projectError 
      }, { status: 500 })
    }

    // Insert tasks
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .insert(originalTasks)
      .select()

    if (taskError) {
      console.error('Error inserting tasks:', taskError)
      return NextResponse.json({ 
        error: 'Failed to insert tasks', 
        details: taskError 
      }, { status: 500 })
    }

    console.log(`Successfully imported ${projects?.length || 0} projects and ${tasks?.length || 0} tasks`)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${projects?.length || 0} projects and ${tasks?.length || 0} tasks`,
      data: {
        projects: projects?.length || 0,
        tasks: tasks?.length || 0
      }
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to import complete BizDev data' 
  })
} 