import 'package:flutter/material';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final bool isLoggedIn = prefs.getBool('user_logged_in') ?? false;
  runApp(SmartStudyApp(isLoggedIn: isLoggedIn));
}

class SmartStudyApp extends StatelessWidget {
  final bool isLoggedIn;
  const SmartStudyApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Smart Study Assistant',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFFAF7F0), // Ivory
        cardColor: const Color(0xFFFFFFFF), // Pure White
        colorScheme: const ColorScheme.light(
          primary: const Color(0xFF7A8B75), // Sage Green
          secondary: const Color(0xFF7A8B75),
          surface: const Color(0xFFFFFFFF),
          background: const Color(0xFFFAF7F0),
        ),
        textTheme: const TextTheme(
          titleLarge: TextStyle(
            fontFamily: 'Space Grotesk',
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
            color: Color(0xFF2F3E32), // Deep Forest/Sage text
          ),
          bodyMedium: TextStyle(
            fontFamily: 'Inter',
            color: Color(0xFF2F3E32),
          ),
        ),
        inputDecorationTheme: const InputDecorationTheme(
          filled: true,
          fillColor: Color(0xFFFFFFFF),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.zero, // Sharp Borders
            borderSide: BorderSide(color: Color(0xFFDDD8CB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.zero,
            borderSide: BorderSide(color: Color(0xFF7A8B75), width: 1.5),
          ),
          labelStyle: TextStyle(color: Color(0xFF7A8B75)),
        ),
        buttonTheme: const ButtonThemeData(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      ),
      home: isLoggedIn ? const DashboardScreen() : const LoginScreen(),
    );
  }
}
