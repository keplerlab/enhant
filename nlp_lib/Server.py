from concurrent import futures
import time

import traceback
import json

from nlp_lib_questions_finder import Questions_finder
from nlp_lib_ensemble import Pecunia_nlp_lib
from nlp_lib_sentiment import Pecunia_nlp_lib_sentiment
from nlp_lib_engagement import Pecunia_nlp_lib_engagement


question_finder = Questions_finder()
pecunia_lib = Pecunia_nlp_lib()
sentiment_lib = Pecunia_nlp_lib_sentiment()
engagement_lib = Pecunia_nlp_lib_engagement()

_ONE_DAY_IN_SECONDS = 60 * 60 * 24

print("\n\n***** Server now ready to serve ...\n")


class Pnlp():
    def Analyze_Conv(self, request, context):

        try:
            print("\n\n****Request", request, "\n")
            origin = request.header.origin
            requestData = request.msg.data
            meeting_id = request.header.conversation_id
            matched_rules_response = pecunia_lib.processMessage(origin, requestData)
            interrogativeSentences = question_finder.processMessage(origin, requestData)
            sentiment_score = sentiment_lib.processMessage(origin, requestData)
            engagement_score = engagement_lib.processMessage(
                meeting_id, origin, request.msg
            )
            response = Pnlp_pb2.AnalyzeResponse()
            response.header.CopyFrom(request.header)
            response.msg.CopyFrom(request.msg)
            response.status = "Ok"
            response.Output.matchedRules.extend(matched_rules_response)
            response.Output.interrogativeSentences.extend(interrogativeSentences)
            response.Output.sentimentScore = "%.2f" % (sentiment_score)
            response.Output.engagementScore = "%.1f" % (engagement_score)
            print("response: ", response)
        except Exception as error:
            print("Exception catcher", error)
            traceback.print_exc()
            raise error

        return response

    def FetchAll_Rules(self, request, context):
        try:
            print("request", request)
            origin = request.header.origin
            if request.msg.name == "FETCH_ALL_RULES":
                all_rules = pecunia_lib.getAllRules(origin)
                response = Pnlp_pb2.RulesResponse()
                response.header.CopyFrom(request.header)
                response.msg.CopyFrom(request.msg)
                response.status = "Ok"
                response.Output.allRules.extend(all_rules)
            else:
                response = Pnlp_pb2.RulesResponse()
                response.header.CopyFrom(request.header)
                response.status = "Error"

            print("responses", response)
        except Exception as error:
            print("Exception catcher", error)
            traceback.print_exc()
            raise error

        return response

    def ResetState(self, request, context):
        try:
            print("\n\nReset request", request)
            if request.msg.name == "RESET_RULES":
                engagement_lib.resetState()
                response = Pnlp_pb2.RulesResponse()
                response.header.CopyFrom(request.header)
                response.msg.CopyFrom(request.msg)
                response.status = "Ok"
            else:
                response = Pnlp_pb2.RulesResponse()
                response.header.CopyFrom(request.header)
                response.status = "Error"

            print("responses", response)
        except Exception as error:
            print("Exception catcher", error)
            traceback.print_exc()
            raise error

        return response

