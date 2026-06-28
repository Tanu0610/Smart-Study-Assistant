import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // 10.0.2.2 is Android emulator local loopback; change to localhost for iOS/web/desktop.
  static const String baseUrl = 'http://10.0.2.2:3000';

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final String? apiKey = prefs.getString('gemini_api_key');
    return {
      'Content-Type': 'application/json',
      if (apiKey != null && apiKey.isNotEmpty) 'x-gemini-api-key': apiKey,
    };
  }

  // Generate study package
  static Future<Map<String, dynamic>> generateStudyPackage({
    required String subject,
    required String topic,
    required String duration,
    required String examType,
    String? userNotes,
  }) async {
    final url = Uri.parse('$baseUrl/api/generate');
    final headers = await _getHeaders();
    final body = jsonEncode({
      'subject': subject,
      'topic': topic,
      'duration': duration,
      'examType': examType,
      if (userNotes != null) 'userNotes': userNotes,
    });

    try {
      final response = await http.post(url, headers: headers, body: body);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Failed to generate study package.');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  // Doubt solving chatbot query
  static Future<String> askDoubt({
    required String topic,
    required Map<String, dynamic> context,
    required List<Map<String, String>> messages,
  }) async {
    final url = Uri.parse('$baseUrl/api/chat');
    final headers = await _getHeaders();
    final body = jsonEncode({
      'topic': topic,
      'context': context,
      'messages': messages,
    });

    try {
      final response = await http.post(url, headers: headers, body: body);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['reply'] ?? '';
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['error'] ?? 'Failed to resolve doubt.');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
}
