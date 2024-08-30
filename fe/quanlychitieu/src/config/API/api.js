import axios from "axios";
import { Cookies } from "react-cookie";

const BASE_URL = "http://localhost:4000";
const cookies = new Cookies();

const request = async ({
    method = "GET",
    path = "",
    data = {},
    headers = {},
    params = {}
}) => {
    try {
        const token = cookies.get("token");
        console.log("Sending token: ", token);

        const response = await axios({
            method: method,
            baseURL: BASE_URL,
            url: path,
            data: data,
            params: params,
            headers: {
                'x-auth-token': token ? token : '',
                ...headers,
            },
        });

        return response.data;
    } catch (err) {
        console.error('API Request Error:', err);
        alert(err?.response?.data?.message || 'An error occurred');
        return null;
    }
};

export default request;