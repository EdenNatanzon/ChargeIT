import basicApi from "../api/basicApi";
import createDataContext from "./createDataContext";

const reviewsReducer = (state, action) => {
    switch (action.type) {
        // case "get_current_location":
        //     return {...state, currentLocation: action.payload};
        default:
            return state;
    }
};

const addReview = (dispatch) => ({grade, review, chargingStationId, nickname}) => {
    let responseData = {};
    const queryParams = {
        grade,
        review,
        chargingStationId,
        nickname
    };

    try {
        basicApi.put("/chargingStations/addReview",null,{ params: queryParams });
    }
    catch (err){
        responseData.error = err.response.data.error;
    }
    return responseData;
};

export const {Context, Provider} = createDataContext(
    reviewsReducer,
    {
        addReview,
    },
    {}
);
