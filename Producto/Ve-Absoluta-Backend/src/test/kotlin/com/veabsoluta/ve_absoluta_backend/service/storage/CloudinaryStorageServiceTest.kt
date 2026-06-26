package com.veabsoluta.ve_absoluta_backend.service.storage

import com.cloudinary.Cloudinary
import com.cloudinary.Uploader
import io.mockk.*
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.util.ReflectionTestUtils
import org.springframework.web.multipart.MultipartFile
import java.io.File

@ExtendWith(MockKExtension::class)
class CloudinaryStorageServiceTest {

    @MockK
    private lateinit var cloudinaryMock: Cloudinary

    @MockK
    private lateinit var uploaderMock: Uploader

    @MockK
    private lateinit var multipartFileMock: MultipartFile

    private lateinit var storageService: CloudinaryStorageService

    @BeforeEach
    fun setUp() {
        // Inicializamos el servicio con credenciales falsas
        storageService = CloudinaryStorageService("cloudName", "apiKey", "apiSecret")

        // Interceptamos la variable generada por el lazy block. 
        // En Kotlin, el campo real por debajo se llama "nombreVariable$delegate"
        val lazyCloudinaryMock = lazy { cloudinaryMock }
        ReflectionTestUtils.setField(storageService, "cloudinary\$delegate", lazyCloudinaryMock)

        // Todo llamado a cloudinary.uploader() devolverá nuestro mock
        every { cloudinaryMock.uploader() } returns uploaderMock
    }

    @Test
    fun `upload debe subir archivo a Cloudinary y devolver la URL segura`() {
        // Arrange: Preparamos el archivo falso
        every { multipartFileMock.originalFilename } returns "evidencia.jpg"
        every { multipartFileMock.bytes } returns "contenido-falso-de-imagen".toByteArray()

        // Arrange: Simulamos lo que respondería Cloudinary en un escenario de éxito
        val cloudinaryResponse = mapOf("secure_url" to "https://res.cloudinary.com/secure_url_123.jpg")
        
        // Atrapamos la llamada a upload
        every { uploaderMock.upload(any<File>(), any<Map<*, *>>()) } returns cloudinaryResponse

        // Act
        val resultUrl = storageService.upload(multipartFileMock)

        // Assert
        assertEquals("https://res.cloudinary.com/secure_url_123.jpg", resultUrl)
        
        // Verificamos que se llamó exactamente una vez al método upload de Cloudinary
        verify(exactly = 1) { uploaderMock.upload(any<File>(), any<Map<*, *>>()) }
    }

    @Test
    fun `upload debe lanzar StorageException si Cloudinary falla`() {
        // Arrange
        every { multipartFileMock.originalFilename } returns "evidencia_corrupta.jpg"
        every { multipartFileMock.bytes } returns "contenido-falso".toByteArray()

        // Simulamos que el SDK de Cloudinary arroja una excepción de red
        every { uploaderMock.upload(any<File>(), any<Map<*, *>>()) } throws RuntimeException("Connection Timeout")

        // Act & Assert
        val exception = assertThrows(StorageException::class.java) {
            storageService.upload(multipartFileMock)
        }

        assertTrue(exception.message!!.contains("Error al subir imagen a Cloudinary"))
        assertTrue(exception.cause is RuntimeException)
    }

    @Test
    fun `delete debe extraer correctamente el publicId de la URL y llamar a destroy`() {
        // Arrange: URL compleja similar a la que entrega Cloudinary
        val fakeUrl = "https://res.cloudinary.com/demo/image/upload/v1234567/ve-absoluta-uploads/img_mi_uuid_secreto.jpg"
        
        // Simulamos que el borrado fue exitoso
        every { uploaderMock.destroy(any(), any()) } returns mapOf("result" to "ok")

        // Act
        storageService.delete(fakeUrl)

        // Assert: Verificamos que tu lógica de partición de strings (split) funcione
        // y extraiga exactamente "ve-absoluta-uploads/img_mi_uuid_secreto"
        verify(exactly = 1) { 
            uploaderMock.destroy("ve-absoluta-uploads/img_mi_uuid_secreto", any()) 
        }
    }

    @Test
    fun `delete no debe arrojar excepcion si falla el rollback`() {
        // Arrange
        val fakeUrl = "https://res.cloudinary.com/demo/image/upload/v123456/ve-absoluta-uploads/test.png"
        
        // Simulamos que Cloudinary falla al borrar
        every { uploaderMock.destroy(any(), any()) } throws RuntimeException("Image not found")

        // Act & Assert
        // Si la excepción no es capturada silenciosamente en el bloque catch de tu delete(), 
        // esta prueba fallaría. Al usar assertDoesNotThrow validamos que tu try-catch funciona.
        assertDoesNotThrow {
            storageService.delete(fakeUrl)
        }
    }
}