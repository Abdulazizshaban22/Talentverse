export const FusionConfig = {
  weights: {
    people:  { ltr: 0.6,  graph: 0.4 },
    jobs:    { ltr: 0.65, graph: 0.35 },
    posts:   { ltr: 0.7,  graph: 0.3 },
    courses: { ltr: 0.6,  graph: 0.4 }
  },
  cutoffs: { top: 50 },
  ltr: {
    featuresets: {
      people:  "tf_features_people",
      jobs:    "tf_features_jobs",
      posts:   "tf_features_posts",
      courses: "tf_features_courses"
    },
    # fallback defaults (if alias doc not found)
    models: {
      people:  "tf_ltr_people_xgb",
      jobs:    "tf_ltr_jobs_xgb",
      posts:   "tf_ltr_posts_xgb",
      courses: "tf_ltr_courses_xgb"
    }
  }
}
