import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Colores principales (alineados con la web)
  static const Color primary = Color(0xFF0F2027);
  static const Color primaryLight = Color(0xFF203A43);
  static const Color accent = Color(0xFF26C6DA);
  static const Color accentLight = Color(0xFF4DD0E1);
  static const Color surface = Color(0xFF1A1A2E);
  static const Color card = Color(0xFF16213E);
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFA726);
  static const Color danger = Color(0xFFEF5350);
  static const Color textPrimary = Color(0xFFE0E0E0);
  static const Color textSecondary = Color(0xFFB0BEC5);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: primary,
      textTheme: GoogleFonts.poppinsTextTheme(
        ThemeData.dark().textTheme,
      ),
      colorScheme: const ColorScheme.dark(
        primary: accent,
        secondary: accentLight,
        surface: surface,
        error: danger,
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: primaryLight,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: accent,
        ),
        iconTheme: const IconThemeData(color: accent),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: primaryLight,
        selectedItemColor: accent,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      cardTheme: CardThemeData(
        color: card,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.black,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: accent,
          side: const BorderSide(color: accent),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accent, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: danger),
        ),
        labelStyle: const TextStyle(color: textSecondary),
        hintStyle: const TextStyle(color: textSecondary),
        prefixIconColor: accent,
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: accent,
        foregroundColor: Colors.black,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: card,
        contentTextStyle: const TextStyle(color: textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: primaryLight,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: surface,
        selectedColor: accent,
        labelStyle: const TextStyle(color: textPrimary),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }
}
