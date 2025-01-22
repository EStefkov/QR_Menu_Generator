package com.example.qr_menu.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;

public class QRCodeGenerator {

    /**
     * Генерира QR код като масив от байтове.
     *
     * @param text  Текстът, който ще бъде кодиран в QR кода.
     * @param width Широчина на QR кода.
     * @param height Височина на QR кода.
     * @return Масив от байтове (PNG изображение).
     * @throws WriterException Ако текстът не може да бъде кодиран.
     * @throws IOException Ако има проблем с потока за изход.
     */
    public static byte[] generateQRCodeImage(String text, int width, int height) throws WriterException, IOException {
        if (text == null || text.isEmpty()) {
            throw new IllegalArgumentException("Text for QR code cannot be null or empty.");
        }

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Записва QR код като PNG файл.
     *
     * @param text  Текстът, който ще бъде кодиран в QR кода.
     * @param width Широчина на QR кода.
     * @param height Височина на QR кода.
     * @param filePath Пътят, където ще се запише QR кодът.
     * @throws WriterException Ако текстът не може да бъде кодиран.
     * @throws IOException Ако има проблем със записването на файла.
     */
    public static void saveQRCodeImage(String text, int width, int height, Path filePath) throws WriterException, IOException {
        if (text == null || text.isEmpty()) {
            throw new IllegalArgumentException("Text for QR code cannot be null or empty.");
        }
        if (filePath == null) {
            throw new IllegalArgumentException("File path cannot be null.");
        }

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);
    }
}
