package com.veabsoluta.ve_absoluta_backend.service

import com.veabsoluta.ve_absoluta_backend.DTO.*
import com.veabsoluta.ve_absoluta_backend.model.Analisis
import com.veabsoluta.ve_absoluta_backend.repository.AnalisisRepository
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.util.ReflectionTestUtils
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.time.LocalDateTime

@ExtendWith(MockKExtension::class)
class AnalisisServiceTest {

    @MockK
    private lateinit var analisisRepository: AnalisisRepository

    @MockK
    private lateinit var webClientBuilder: WebClient.Builder

    @MockK
    private lateinit var webClient: WebClient

    // Usaremos un Spy para poder interceptar llamadas a métodos internos de la misma clase
    private lateinit var analisisService: AnalisisService

    @BeforeEach
    fun setUp() {
        every { webClientBuilder.baseUrl(any()) } returns webClientBuilder
        every { webClientBuilder.defaultHeader(any(), any()) } returns webClientBuilder
        every { webClientBuilder.codecs(any()) } returns webClientBuilder
        every { webClientBuilder.build() } returns webClient

        analisisService = spyk(AnalisisService(analisisRepository, webClientBuilder))

        ReflectionTestUtils.setField(analisisService, "aiServiceUrl", "http://mock-ai-url:8000")
    }

    @Test
    fun `obtenerEstadisticasGlobales debe retornar el mapeo correcto`() {
        every { analisisRepository.count() } returns 15L
        every { analisisRepository.countByPrediccion("REAL") } returns 10L
        every { analisisRepository.countByPrediccion("FAKE") } returns 5L

        val estadisticas = analisisService.obtenerEstadisticasGlobales()

        assertEquals(15L, estadisticas["total"])
        assertEquals(10L, estadisticas["reales"])
        assertEquals(5L, estadisticas["fake"])
        
        verify(exactly = 1) { analisisRepository.count() }
        verify(exactly = 1) { analisisRepository.countByPrediccion("REAL") }
        verify(exactly = 1) { analisisRepository.countByPrediccion("FAKE") }
    }

    @Test
    fun `obtenerTodosLosCasos debe retornar lista ordenada`() {
        // Arrange usando ReflectionTestUtils para no romper la inmutabilidad de 'val'
        val analisis1 = Analisis(id = 1L, nombreArchivo = "A", rutaArchivo = "", prediccion = "REAL", confianza = 0.9)
        ReflectionTestUtils.setField(analisis1, "fecha", LocalDateTime.now().minusDays(2))
        
        val analisis2 = Analisis(id = 2L, nombreArchivo = "B", rutaArchivo = "", prediccion = "FAKE", confianza = 0.9)
        ReflectionTestUtils.setField(analisis2, "fecha", LocalDateTime.now())
        
        every { analisisRepository.findAll() } returns listOf(analisis1, analisis2)

        // Act
        val resultados = analisisService.obtenerTodosLosCasos()

        // Assert
        assertEquals(2, resultados.size)
        assertEquals(2L, resultados[0].id, "El primer elemento debe ser el más reciente")
        assertEquals(1L, resultados[1].id, "El segundo elemento debe ser el más antiguo")
    }

    @Test
    fun `ejecutarDeteccion debe procesar correctamente un caso FAKE y guardarlo`() {
        val rutaImagen = "https://cloudinary.com/imagen.jpg"
        val nombreArchivo = "imagen.jpg"

        val pythonResponseMock = mockk<PythonResponse>()
        every { pythonResponseMock.veredicto_final } returns "FAKE"
        every { pythonResponseMock.confianza_global } returns 98.5
        every { pythonResponseMock.heatmap_base64 } returns "base64String"
        every { pythonResponseMock.heatmap_threshold } returns null
        every { pythonResponseMock.heatmap_rollout } returns null
        every { pythonResponseMock.desglose_pericial } returns null
        every { pythonResponseMock.metadata } returns null
        every { pythonResponseMock.datos_crudos_frontend } returns null

        every { analisisService.realizarPeticionIAInternal(any()) } returns Mono.just(pythonResponseMock)

        val entidadGuardada = Analisis(
            id = 99L,
            nombreArchivo = nombreArchivo,
            rutaArchivo = rutaImagen,
            prediccion = "FAKE",
            confianza = 0.985
        )
        val slotAnalisis = slot<Analisis>()
        every { analisisRepository.save(capture(slotAnalisis)) } returns entidadGuardada

        val respuesta = analisisService.ejecutarDeteccion(rutaImagen, nombreArchivo)

        assertEquals(99L, respuesta.id)
        assertEquals("FAKE", respuesta.veredicto_final)
        assertEquals(98.5, respuesta.confianza_global)
        assertEquals("base64String", respuesta.heatmap_base64)

        val analisisCapturado = slotAnalisis.captured
        assertEquals("imagen.jpg", analisisCapturado.nombreArchivo)
        assertEquals("FAKE", analisisCapturado.prediccion)
        assertEquals(0.985, analisisCapturado.confianza)

        verify(exactly = 1) { analisisRepository.save(any()) }
    }

    @Test
    fun `normalizarPrediccion debe lanzar excepcion si el motor Python devuelve basura`() {
        val inputMalo = "INDECISO"

        val exception = assertThrows(AnalisisServiceException::class.java) {
            ReflectionTestUtils.invokeMethod<String>(analisisService, "normalizarPrediccion", inputMalo)
        }

        assertTrue(exception.message!!.contains("Predicción IA no reconocida"))
        assertEquals(ErrorCode.IA_SERVICE_ERROR, exception.codigo)
    }
    
    @Test
    fun `normalizarPrediccion debe manejar correctamente textos reales`() {
        val result1 = ReflectionTestUtils.invokeMethod<String>(analisisService, "normalizarPrediccion", "Es muy Authentic")
        val result2 = ReflectionTestUtils.invokeMethod<String>(analisisService, "normalizarPrediccion", "TOTALMENTE REAL")
        
        assertEquals("REAL", result1)
        assertEquals("REAL", result2)
    }
}