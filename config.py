hevrat_hashmal_plan_name = "plan_hevrat_hashmal1"
price_of_kWh = 0.6145
plans = {
  "plan_hevrat_hashmal1": {
    "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "discount": 0,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter", "Simple Meter"]
  },
  "plan_cellcom1": {
    "hours": [14, 15, 16, 17, 18, 19],
    "discount": 0.18,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
     "work_with_meter": ["Smart Meter"]
  },
  "plan_cellcom2": {
    "hours": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    "discount": 0.15,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    "work_with_meter": ["Smart Meter"]
  },
  "plan_cellcom3": {
    "hours": [23, 0, 1, 2, 3, 4, 5, 6],
    "discount": 0.2,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter"]
  },
  "plan_cellcom4": {
    "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "discount": [0.05, 0.06, 0.07],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter", "Simple Meter"]
  },
  "plan_paz1": {
    "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "discount": 0.07,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter", "Simple Meter"]
  },
  "plan_electra_power1": {
    "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "discount": [0.05, 0.06, 0.07],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter", "Simple Meter"]
  },
  "plan_electra_power2": {
    "hours": [23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    "discount": [0.08, 0.09, 0.1],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter"]

  },
  "plan_electra_power3": {
    "hours": [23, 0, 1, 2, 3, 4, 5, 6],
    "discount": 0.2,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter"]
  },
    "plan_hot1": {
    "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "discount": [0.05, 0.06, 0.07],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "work_with_meter": ["Smart Meter", "Simple Meter"]
  },
    "plan_hot2": {
    "hours": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    "discount": 0.15,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      "work_with_meter": ["Smart Meter"]
  },
  "plan_hot3": {
    "hours": [23, 0, 1, 2, 3, 4, 5, 6],
    "discount": 0.2,
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "work_with_meter": ["Smart Meter"]
  },
    "plan_hot4": {
        "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        "discount": 0.07,
        "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "work_with_meter": ["Smart Meter", "Simple Meter"],
      "more_services_that_needed": ["hot_triple"]
    },
    "plan_hot5": {
        "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        "discount": 0.1,
        "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "work_with_meter": ["Smart Meter", "Simple Meter"],
      "more_services_that_needed": ["hot_triple", "hot_mobile"]
    },
    "plan_hot6": {
        "hours": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        "discount": 0.06,
        "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "work_with_meter": ["Smart Meter", "Simple Meter"],
      "more_services_that_needed": ["next_double"]
    }
}


plans_translate_to_hebrew = {"plan_hevrat_hashmal1": "בלי מסלול-חברת חשמל",
"plan_cellcom1": "סלקום אנרג'י -חוסכים למשפחה",
"plan_cellcom2": "סלקום אנרג'י-חוסכים ביום",
"plan_cellcom3": "סלקום אנרג'י -חוסכים בלילה",
"plan_cellcom4": "סלקום אנרג'י -חוסכים קבוע",
"plan_paz1": "פזגז -הנחה 24/7",
"plan_electra_power1": "אלקטרה פאוור -מסלול POWER",
"plan_electra_power2": "אלקטרה פאוור -מסלול הייטק",
"plan_electra_power3": "אלקטרה פאוור -מסלול לילה",
"plan_hot1": "הוט אנרג'י -חוסכים 24/7",
"plan_hot2": "הוט אנרג'י -חוסכים ביום",
"plan_hot3": "הוט אנרג'י -חוסכים בלילה",
"plan_hot4": "הוט אנרג'י -חוסכים קבוע HOT- מסלול ללקוחות הוט טריפל בלבד",
"plan_hot5": "הוט אנרג'י - e- triple- הנחה ללקוחות HOT טריפל ומובייל בלבד",
"plan_hot6": "הוט אנרג'י -חוסכים קבוע NEXT- מסלול ללקוחות דאבל NEXT בלבד"}