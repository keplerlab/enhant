from os import path
import json

from pecunia_nlp_lib_fuzzyWuzzy import FuzzyWuzzy
from pecunia_nlp_lib_tf import TF_ULM


class Pecunia_nlp_lib(object):
    weight_fuzzy_tokenset = 1.0
    weight_fuzzy_partial_ratio = 1.0
    weight_tf_ulm = 1.0
    final_threshold = 65
    ADVISOR = "advisor"
    CLIENT = "client"

    def __init__(self):
        self.advisor_rules = self._init_advisor_rules()
        self.customer_rules = self._init_client_rules()
        self.ulm_obj = TF_ULM(self.advisor_rules, self.customer_rules)

    def processMessage(self, origin, requestData):

        speaker = origin
        rules = self._read_rules(speaker)

        filtered_rules = self.extract_responses(speaker, requestData)

        return filtered_rules

    def getAllRules(self, origin):
        allRules = self._read_rules(origin)
        allRules = list(allRules.keys())
        print("Rules", allRules)
        return allRules

    def _isRequestValid(self, pkt):
        if ("msg" in pkt) and ("header" in pkt):
            return True
        else:
            return False

    def _init_advisor_rules(self):
        # Read all the approved master for utterances advisor
        advisor_rules = ""
        with open("Rules/master_rules_advisor.json", "r") as content:
            advisor_rules = json.load(content)
        return advisor_rules

    def _init_client_rules(self):
        # Read all the approved master for utterances client
        customer_rules = ""
        with open("Rules/master_rules_client.json", "r") as content:
            customer_rules = json.load(content)
        return customer_rules

    def _read_rules(self, speaker):
        if speaker == Pecunia_nlp_lib.ADVISOR:
            rules = self.advisor_rules
        elif speaker == Pecunia_nlp_lib.CLIENT:
            rules = self.customer_rules
        else:
            raise RuntimeError("RuntimeError: Unsupported speaker: " + speaker)
        return rules

    def prepare_response(self, status=None, response=None):
        if status == 200:
            return json.dumps(response), status, {"ContentType": "application/json"}
        else:
            return json.dumps(response), status, {"ContentType": "application/json"}

    def extract_responses(self, speaker, data):
        """ Extracts the final filtered rules after averaging the weights """

        rules = ""
        if speaker == Pecunia_nlp_lib.ADVISOR:
            rules = self.advisor_rules
        elif speaker == Pecunia_nlp_lib.CLIENT:
            rules = self.customer_rules
        else:
            raise RuntimeError("RuntimeError: Unsupported speaker: " + speaker)

        # Derive the responses using fuzzy wuzzy algos

        fw_obj_token = FuzzyWuzzy(data, FuzzyWuzzy.TOKENSET, rules)

        token_algo_scores = fw_obj_token.get_responses()

        fw_obj_PR = FuzzyWuzzy(data, FuzzyWuzzy.PARTIAL_RATIO, rules)
        partial_algo_scores = fw_obj_PR.get_responses()

        # Derive the responses using sentences vector
        tf_ulm_scores = self.ulm_obj.get_responses(data, rules, speaker)

        # Filter the rules using the aggregation/averaging logic
        filtered_rules = self._filter_rules(
            token_algo_scores, partial_algo_scores, tf_ulm_scores,
        )

        return filtered_rules

    def _filter_rules(
        self,
        rules_scores_fuzzy_tokenset,
        rules_scores_fuzzy_partial_ratio,
        rules_scores_tf_ulm,
    ):
        filter_rules = []
        for key, value_fuzzy_tokenset in rules_scores_fuzzy_tokenset.items():
            value_fuzzy_partial_ratio = rules_scores_fuzzy_partial_ratio[key]
            value_tf_ulm = rules_scores_tf_ulm[key]

            ensemble_value = (
                Pecunia_nlp_lib.weight_fuzzy_tokenset * value_fuzzy_tokenset
                + Pecunia_nlp_lib.weight_fuzzy_partial_ratio * value_fuzzy_partial_ratio
                + Pecunia_nlp_lib.weight_tf_ulm * value_tf_ulm
            ) / (
                Pecunia_nlp_lib.weight_fuzzy_tokenset
                + Pecunia_nlp_lib.weight_fuzzy_partial_ratio
                + Pecunia_nlp_lib.weight_tf_ulm
            )

            if (
                ensemble_value > Pecunia_nlp_lib.final_threshold
            ):  # Threshold for filtering
                filter_rules.append(key)
        return filter_rules

    def _extract_data_from_msg(self, msg):
        return msg["data"]
