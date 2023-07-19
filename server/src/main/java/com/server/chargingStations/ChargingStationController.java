package com.server.chargingStations;

import com.google.gson.*;
import com.server.location.GeoLocation;
import com.server.location.GeoUtils;
import com.server.users.money.MoneyTransaction;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import static com.server.ServerConfig.MAX_DISTANCE_FROM_STATION_IN_METERS;
import static com.server.location.GeoUtils.distanceBetweenPointsInKilometers;

@RestController
@RequestMapping("/chargingStations")
public class ChargingStationController {
    @Autowired
    private ChargingStationRepository m_chargingStationsRepository;

    @PostMapping("/createChargingStation")
    public ResponseEntity<String> createChargingStation(@RequestBody ChargingStationJson chargingStationJson, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            try
            {
                // Check if the location already exists in the database
                ChargingStation existingChargingStation = m_chargingStationsRepository.findByLocation(chargingStationJson.getLocation()).orElseThrow(() -> new RuntimeException("Charging Station not found"));
                jsonObject.addProperty("message", "ChargingStation already exists with the given location.");
                httpStatus = HttpStatus.BAD_REQUEST;
            }
            catch (RuntimeException runtimeException)
            {
                ChargingStation chargingStation = new ChargingStation(chargingStationJson.getLocation(), (ObjectId) session.getAttribute("id"),
                        chargingStationJson.getPricePerVolt(), chargingStationJson.getChargerType(), chargingStationJson.getStationName());
                m_chargingStationsRepository.save(chargingStation);
                jsonObject.addProperty("message", "Created ChargingStation successfully.");
                jsonObject.addProperty("chargingStationId", chargingStation.getId().toString());
                try
                {
                    sendChargingStationIDToSimulator(chargingStation.getId().toString());
                }
                catch (Exception exception)
                {
                    // Handle exception.
                }
            }
        }
        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    private void sendChargingStationIDToSimulator(String chargingStationId) {
        String applicationBUrl = "http://localhost:8081/simulator/chargingStations";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String requestBody = "{\"chargingStationId\": \"" + chargingStationId + "\"}";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> responseEntity = restTemplate.exchange(applicationBUrl, HttpMethod.POST, requestEntity, String.class);
        String response = responseEntity.getBody();
        //System.out.println("Response from Simulator: " + response);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteChargingStationById(@RequestParam("chargingStationId") String chargingStationId, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            ChargingStation station = m_chargingStationsRepository.findById(new ObjectId(chargingStationId)).orElseThrow(() -> new RuntimeException("Charging Station not found"));
            if(station.getOwnerId().equals((ObjectId) session.getAttribute("id")))
            {
                station.unCharge();
                m_chargingStationsRepository.save(station);
                m_chargingStationsRepository.deleteByLocation(station.getLocation());
                jsonObject.addProperty("message", "Charging station deleted successfully");
            }
            else
            {
                httpStatus = HttpStatus.FORBIDDEN;
                jsonObject.addProperty("message", "You do not have permission to delete this charging station");
            }
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllChargingStationsByOwner(HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            List<ChargingStation> chargingStations = m_chargingStationsRepository.findByOwnerId((ObjectId) session.getAttribute("id"));
            if(chargingStations.isEmpty())
            {
                jsonObject.addProperty("message", "No charging stations found for this owner");
            }
            else
            {
                for (ChargingStation station : chargingStations) {
                    // Uncharge each charging station before deleting it
                    station.unCharge();
                    m_chargingStationsRepository.save(station);
                }
                m_chargingStationsRepository.deleteAllByOwnerId((ObjectId) session.getAttribute("id"));
                jsonObject.addProperty("message", "All charging stations deleted successfully");
            }
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/getAllChargingStations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<String> getAllChargingStations(HttpServletRequest request) {
        /*// Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new RuntimeException("Unauthorized");
        }*/

        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        List<ChargingStation> chargingStations = m_chargingStationsRepository.findAll();

        // Convert the list of charging stations to JSON
        Gson gson = new Gson();
        JsonArray jsonArray = new JsonArray();
        int index = 0;
        for (ChargingStation station : chargingStations) {
            JsonObject chargingStationJson = new JsonObject();
            ChargingStationDTO chargingStationDTO = new ChargingStationDTO(station.getId().toString(), station.getLocation(), station.getPricePerVolt(), station.getChargerType(), station.getStatus(), station.getStationName(), station.getReviews());
            chargingStationJson.addProperty(Integer.toString(index++), gson.toJson(chargingStationDTO));
            jsonArray.add(chargingStationJson);
        }
        jsonObject.add("chargingStations", jsonArray);

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @GetMapping(value = "/getAllUserChargingStations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<String> getAllUserChargingStations(HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            List<ChargingStation> chargingStations = m_chargingStationsRepository.findByOwnerId((ObjectId) session.getAttribute("id"));

            // Convert the list of charging stations to JSON
            Gson gson = new Gson();
            JsonArray jsonArray = new JsonArray();
            int index = 0;
            for (ChargingStation station : chargingStations) {
                JsonObject chargingStationJson = new JsonObject();
                ChargingStationDTO chargingStationDTO = new ChargingStationDTO(station.getId().toString(), station.getLocation(), station.getPricePerVolt(), station.getChargerType(), station.getStatus(), station.getStationName(), station.getReviews());
                chargingStationJson.addProperty(Integer.toString(index++), gson.toJson(chargingStationDTO));
                jsonArray.add(chargingStationJson);
            }
            jsonObject.add("chargingStations", jsonArray);
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/getChargingStation", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<String> getChargingStation(@RequestParam("chargingStationId") String chargingStationId, HttpServletRequest request) {
        /*// Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new RuntimeException("Unauthorized");
        }*/

        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        try
        {
            ChargingStation station = m_chargingStationsRepository.findById(new ObjectId(chargingStationId)).orElseThrow(() -> new RuntimeException("Charging Station not found"));
            ChargingStationDTO chargingStationDTO = new ChargingStationDTO(station.getId().toString(), station.getLocation(), station.getPricePerVolt(), station.getChargerType(), station.getStatus(), station.getStationName(), station.getReviews());
            Gson gson = new Gson();
            JsonElement jsonElement = gson.toJsonTree(chargingStationDTO);
            JsonObject chargingStationJson = jsonElement.getAsJsonObject();
            jsonObject.add("chargingStation", chargingStationJson);
        }
        catch (RuntimeException runtimeException)
        {
            httpStatus = HttpStatus.NOT_FOUND;
            jsonObject.addProperty("error", runtimeException.getMessage());
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @CrossOrigin(origins = "*")
    @GetMapping(value = "/getChargingStationsByRadius", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<String> getChargingStationsByRadius(@RequestParam("latitude") double latitude,
                                                              @RequestParam("longitude") double longitude,
                                                              @RequestParam("radius") double radius,
                                                              HttpServletRequest request)
    {
        /*// Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new RuntimeException("Unauthorized");
        }*/

        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        if(radius >= 0)
        {
            List<ChargingStation> chargingStations = m_chargingStationsRepository.findAll();
            List<ChargingStation> chargingStationsWithinRadius = new ArrayList<>();

            for (ChargingStation station : chargingStations) {
                GeoLocation stationLocation = station.getLocation();
                double distanceInKilometers = distanceBetweenPointsInKilometers(latitude, longitude,
                        stationLocation.getLatitude(), stationLocation.getLongitude());

                if (distanceInKilometers <= radius) {
                    chargingStationsWithinRadius.add(station);
                }
            }

            // Sort the charging stations by distance from the given location
            Collections.sort(chargingStationsWithinRadius, new Comparator<ChargingStation>() {
                @Override
                public int compare(ChargingStation station1, ChargingStation station2) {
                    GeoLocation location1 = station1.getLocation();
                    GeoLocation location2 = station2.getLocation();
                    double distance1 = distanceBetweenPointsInKilometers(latitude, longitude,
                            location1.getLatitude(), location1.getLongitude());
                    double distance2 = distanceBetweenPointsInKilometers(latitude, longitude,
                            location2.getLatitude(), location2.getLongitude());

                    return Double.compare(distance1, distance2);
                }
            });


            // Convert the list of charging stations to JSON
            Gson gson = new Gson();
            JsonArray jsonArray = new JsonArray();
            for (ChargingStation station : chargingStationsWithinRadius) {
                JsonObject chargingStationJson = new JsonObject();
                double distanceInKilometers = distanceBetweenPointsInKilometers(latitude, longitude, station.getLocation().getLatitude(), station.getLocation().getLongitude());
                ChargingStationDTO chargingStationDTO = new ChargingStationDTO(station.getId().toString(), station.getLocation(), station.getPricePerVolt(), station.getChargerType(), station.getStatus(), station.getStationName(), station.getReviews());
                chargingStationJson.addProperty(Double.toString(distanceInKilometers), gson.toJson(chargingStationDTO));
                jsonArray.add(chargingStationJson);
            }

            jsonObject.add("chargingStations", jsonArray);
        }
        else
        {
            httpStatus = HttpStatus.BAD_REQUEST;
            jsonObject.addProperty("error", "Radius must be non-negative");
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());

    }

    @PutMapping("/charge")
    public ResponseEntity<String> charge(@RequestParam("chargingStationId") String chargingStationId, @RequestBody GeoLocation currentGeoLocation, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            ChargingStation station = m_chargingStationsRepository.findById(new ObjectId(chargingStationId)).orElseThrow(() -> new RuntimeException("Charging Station not found"));
            if(station.getStatus().equals(Estatus.NOT_CHARGING))
            {
                if(GeoUtils.distanceBetweenPointsInKilometers(station.getLocation().getLatitude(), station.getLocation().getLongitude(),
                        currentGeoLocation.getLatitude(), currentGeoLocation.getLongitude()) * 1000 <= MAX_DISTANCE_FROM_STATION_IN_METERS)
                {
                    //Get user
                    RestTemplate restTemplate = new RestTemplate();
                    HttpHeaders headers = new HttpHeaders();
                    headers.add("Cookie", request.getHeader("Cookie"));
                    HttpEntity<String> httpEntity = new HttpEntity<>(headers);
                    String url = "http://localhost:8080/users/getUser";
                    ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, httpEntity, String.class);

                    if(response.getStatusCode() == HttpStatus.OK)
                    {
                        JsonObject responseJson = JsonParser.parseString(response.getBody()).getAsJsonObject();
                        JsonElement isValidIsraeliCreditCardElement = responseJson.getAsJsonObject("user").get("isValidIsraeliCreditCard");
                        boolean isValidIsraeliCreditCard = isValidIsraeliCreditCardElement.getAsBoolean();
                        if(isValidIsraeliCreditCard)
                        {
                            try {
                                restTemplate = new RestTemplate();
                                headers = new HttpHeaders();
                                headers.add("Cookie", request.getHeader("Cookie"));
                                httpEntity = new HttpEntity<>(headers);
                                url = "http://localhost:8081/simulator/charge?chargingStationId=" + chargingStationId;
                                restTemplate.exchange(url, HttpMethod.PUT, httpEntity, String.class);
                            } catch (Exception exception) {

                            }

                            station.charge();
                            m_chargingStationsRepository.save(station);
                            jsonObject.addProperty("message", "Charging...");
                        }
                        else
                        {
                            httpStatus = HttpStatus.UNAUTHORIZED;
                            jsonObject.addProperty("error", "In order to charge you need a valid israeli CreditCard.");
                        }
                    }
                    else
                    {
                        httpStatus = (HttpStatus) response.getStatusCode();
                        jsonObject.addProperty("error", "Failed to get user for the CreditCard check.");
                    }
                }
                else
                {
                    httpStatus = HttpStatus.FORBIDDEN;
                    jsonObject.addProperty("error-message", "You need to be in the range of 50 meters from the charging station in order to charge.");
                }
            }
            else
            {
                String errorMessage;
                httpStatus = HttpStatus.LOCKED;
                errorMessage = "ChargingStation is charging.";
                jsonObject.addProperty("error-message", errorMessage);
            }
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @PutMapping("/unCharge")
    public ResponseEntity<String> unCharge(@RequestParam("chargingStationId") String chargingStationId, @RequestBody GeoLocation currentGeoLocation, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            ChargingStation station = m_chargingStationsRepository.findById(new ObjectId(chargingStationId)).orElseThrow(() -> new RuntimeException("Charging Station not found"));
            if(station.getStatus().equals(Estatus.CHARGING))
            {
                if(GeoUtils.distanceBetweenPointsInKilometers(station.getLocation().getLatitude(), station.getLocation().getLongitude(),
                        currentGeoLocation.getLatitude(), currentGeoLocation.getLongitude()) * 1000 <= MAX_DISTANCE_FROM_STATION_IN_METERS)
                {
                    int percentToAskPayFor = 0;

                    try {
                        RestTemplate restTemplate = new RestTemplate();
                        HttpHeaders headers = new HttpHeaders();
                        headers.add("Cookie", request.getHeader("Cookie"));
                        HttpEntity<String> httpEntity = new HttpEntity<>(headers);
                        String url = "http://localhost:8081/simulator/unCharge";
                        restTemplate.exchange(url, HttpMethod.PUT, httpEntity, String.class);

                        String applicationBUrl = "http://localhost:8081/simulator/unCharge";
                        ResponseEntity<Integer> response = restTemplate.exchange(applicationBUrl, HttpMethod.PUT, httpEntity, Integer.class);
                        percentToAskPayFor = response.getBody();
                        //System.out.println("Please Pay: " + percentToAskPayFor* station.getPricePerVolt());
                    } catch (Exception exception) {

                    }

                    station.unCharge();
                    m_chargingStationsRepository.save(station);
                    jsonObject.addProperty("message", "UnCharge.");
                    jsonObject.addProperty("payment", (percentToAskPayFor * station.getPricePerVolt()));

                    // Update MoneyTransaction
                    MoneyTransaction moneyTransaction = new MoneyTransaction(percentToAskPayFor * station.getPricePerVolt());

                    // Call the updateMoneyTransaction endpoint to update the transaction
                    String updateTransactionUrl = "http://localhost:8080/users/updateMoneyTransaction";
                    HttpHeaders headers = new HttpHeaders();
                    headers.add("Cookie", request.getHeader("Cookie"));
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<MoneyTransaction> updateTransactionRequest = new HttpEntity<>(moneyTransaction, headers);
                    RestTemplate restTemplate = new RestTemplate();

                    UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(updateTransactionUrl)
                            .queryParam("customerId", (ObjectId) session.getAttribute("id"))
                            .queryParam("ownerId", station.getOwnerId());

                    String urlWithParams = builder.toUriString();
                    ResponseEntity<String> response = restTemplate.exchange(urlWithParams, HttpMethod.PUT, updateTransactionRequest, String.class);
                    // End update MoneyTransaction
                }
                else
                {
                    httpStatus = HttpStatus.FORBIDDEN;
                    jsonObject.addProperty("error-message", "You need to be in the range of 50 meters from the charging station in order to unCharge.");
                }
            }
            else
            {
                String errorMessage;
                httpStatus = HttpStatus.BAD_REQUEST;
                errorMessage = "ChargingStation isn't charging.";
                jsonObject.addProperty("error-message", errorMessage);
            }
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @PutMapping("/updatePricePerVolt")
    public ResponseEntity<String> updatePricePerVolt(@RequestParam("pricePerVolt") double pricePerVolt, @RequestParam("chargingStationId") String chargingStationId, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            ChargingStation station = m_chargingStationsRepository.findById(new ObjectId(chargingStationId)).orElseThrow(() -> new RuntimeException("Charging Station not found"));
            // Check if the input string is a valid price
            if (pricePerVolt <= 0)
            {
                httpStatus = HttpStatus.BAD_REQUEST;
                jsonObject.addProperty("error", "Invalid price per volt");        }
            else
            {
                station.setPricePerVolt(pricePerVolt);
                m_chargingStationsRepository.save(station);
                jsonObject.addProperty("message", "Update price per volt successfully.");
            }
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }

    @PutMapping("/addReview")
    public ResponseEntity<String> addReview(@RequestParam("grade") int grade, @RequestParam("review") String review, @RequestParam("nickname") String nickname, @RequestParam("chargingStationId") String chargingStationId, HttpServletRequest request) {
        HttpStatus httpStatus = HttpStatus.OK;
        JsonObject jsonObject = new JsonObject();

        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null)
        {
            httpStatus = HttpStatus.UNAUTHORIZED;
            jsonObject.addProperty("error", "No valid session.");
        }
        else
        {
            ChargingStation station = m_chargingStationsRepository.findById(new ObjectId(chargingStationId)).orElseThrow(() -> new RuntimeException("Charging Station not found"));

            Review review1 = new Review(review, grade, nickname);
            station.addReview(review1);
            m_chargingStationsRepository.save(station);
            jsonObject.addProperty("message", "Add review successfully.");
        }

        return ResponseEntity.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonObject.toString());
    }
}
