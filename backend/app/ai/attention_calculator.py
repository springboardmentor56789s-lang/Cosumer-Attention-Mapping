class AttentionAnalyzer:


    def calculate_attention(
        self,
        frames_processed,
        persons_detected
    ):


        # Avoid division by zero

        if frames_processed == 0:

            return {

                "attention_score": 0,

                "attention_level": "Low"

            }



        # Average people appearing per frame

        average_people = (

            persons_detected
            /
            frames_processed

        )



        # Convert to percentage
        #
        # Assumption:
        # 5 or more people in a frame = maximum attention
        #

        attention_score = (

            average_people
            /
            5

        ) * 100



        # Keep value between 0-100

        attention_score = min(

            attention_score,

            100

        )



        attention_score = round(

            attention_score,

            2

        )



        # Attention category

        if attention_score >= 75:

            attention_level = "High"


        elif attention_score >= 40:

            attention_level = "Medium"


        else:

            attention_level = "Low"



        return {


            "attention_score":

                attention_score,


            "attention_level":

                attention_level,


            "average_people":

                round(

                    average_people,

                    2

                )

        }