
from app.ai.model import UrgencyScoringModel
from app.agents.learner import predict_adjustment

model = UrgencyScoringModel()


def plan_triage(features):

    planner_score = model.predict(features)

    learner_adjustment = predict_adjustment(features)

    final_score = (0.7 * planner_score) + (0.3 * (planner_score + learner_adjustment))

    label = model.interpret(final_score)

    return round(final_score, 2), label
