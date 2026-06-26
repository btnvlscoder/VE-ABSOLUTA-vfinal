package com.veabsoluta.ve_absoluta_backend.controller

import com.veabsoluta.ve_absoluta_backend.DTO.AnalisisForenseResponse
import com.veabsoluta.ve_absoluta_backend.model.Analisis
import com.veabsoluta.ve_absoluta_backend.service.AnalisisService
import com.veabsoluta.ve_absoluta_backend.service.storage.StorageService
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.http.MediaType
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.multipart.MultipartFile

@ExtendWith(MockKExtension::class)
class AnalisisControllerTest {

    @MockK
    private lateinit var analisisService: AnalisisService

    @MockK
    private lateinit var storageService: StorageService

    private lateinit var mockMvc: MockMvc
    private lateinit var controller: AnalisisController

    @BeforeEach
    fun setUp() {
        controller = AnalisisController(analisisService, storageService)
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build()
    }

    @Test
    fun `upload debe retornar 200 OK cuando todo el flujo es exitoso`() {
        // Arrange
        val file = MockMultipartFile(
            "file", "imagen.jpg", MediaType.IMAGE_JPEG_VALUE, "bytes-falsos".toByteArray()
        )
        val urlMock = "https://cloudinary.com/imagen.jpg"
        
        // CORRECCIÓN 1: Usamos el DTO correcto que espera el controlador
        val resultadoMock = mockk<AnalisisForenseResponse>(relaxed = true)
        every { resultadoMock.veredicto_final } returns "FAKE"
        every { resultadoMock.confianza_global } returns 0.99

        // CORRECCIÓN 2: Le decimos explícitamente a Kotlin los tipos de any()
        every { storageService.upload(any<MultipartFile>()) } returns urlMock
        every { analisisService.ejecutarDeteccion(any<String>(), any<String>()) } returns resultadoMock

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/analizar/upload").file(file))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.veredicto_final").value("FAKE"))
            .andExpect(jsonPath("$.confianza_global").value(0.99))

        verify(exactly = 1) { storageService.upload(any<MultipartFile>()) }
        verify(exactly = 1) { analisisService.ejecutarDeteccion(any<String>(), any<String>()) }
    }

    @Test
    fun `upload debe fallar con 400 Bad Request si el archivo no es imagen permitida`() {
        // Arrange
        val invalidFile = MockMultipartFile(
            "file", "documento.pdf", MediaType.APPLICATION_PDF_VALUE, "pdf-bytes".toByteArray()
        )

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/analizar/upload").file(invalidFile))
            .andExpect(status().isBadRequest)
            .andExpect(status().reason("Tipo de archivo no válido. Solo se aceptan: JPEG, PNG, WebP"))

        verify { storageService wasNot Called }
        verify { analisisService wasNot Called }
    }

    @Test
    fun `upload debe ejecutar el Rollback en Cloudinary si la IA falla`() {
        // Arrange
        val file = MockMultipartFile(
            "file", "imagen.png", MediaType.IMAGE_PNG_VALUE, "bytes".toByteArray()
        )
        val urlMock = "https://cloudinary.com/imagen.png"

        every { storageService.upload(any<MultipartFile>()) } returns urlMock
        every { analisisService.ejecutarDeteccion(any<String>(), any<String>()) } throws RuntimeException("Error del Motor IA")
        every { storageService.delete(urlMock) } just Runs

        // Act & Assert
        // CORRECCIÓN 3: Usamos Exception general para evitar problemas de dependencias de Spring
        val exception = assertThrows(Exception::class.java) {
            mockMvc.perform(multipart("/api/v1/analizar/upload").file(file))
        }

        // Verificamos que el error interno fue el que nosotros simulamos
        assertTrue(exception.cause is RuntimeException)
        assertTrue(exception.cause?.message == "Error del Motor IA")

        verify(exactly = 1) { storageService.upload(any<MultipartFile>()) }
        verify(exactly = 1) { storageService.delete(urlMock) }
    }

    @Test
    fun `obtenerHistorial debe retornar lista con 200 OK`() {
        // Arrange
        val historialMock = listOf(
            Analisis(id = 1L, nombreArchivo = "A.jpg", rutaArchivo = "", prediccion = "REAL", confianza = 0.9),
            Analisis(id = 2L, nombreArchivo = "B.jpg", rutaArchivo = "", prediccion = "FAKE", confianza = 0.8)
        )
        every { analisisService.obtenerTodosLosCasos() } returns historialMock

        // Act & Assert
        mockMvc.perform(get("/api/v1/analizar/historial"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].prediccion").value("REAL"))
    }

    @Test
    fun `obtenerEstadisticas debe retornar 200 OK con el mapa de datos`() {
        // Arrange
        val statsMock = mapOf("total" to 100L, "reales" to 80L, "fake" to 20L)
        every { analisisService.obtenerEstadisticasGlobales() } returns statsMock

        // Act & Assert
        mockMvc.perform(get("/api/v1/analizar/estadisticas"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.total").value(100))
            .andExpect(jsonPath("$.reales").value(80))
            .andExpect(jsonPath("$.fake").value(20))
    }
}