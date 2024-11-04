using System;

namespace TestProject2
{
    public class TestProgram2Main {
        public static void Main(string[] args) {
            Console.WriteLine("Hello, TestProject2!");
        }
    }
}

namespace TestProject2.Models
{
    public class Factory {
        public int Id { get; set;}
        public string? Name { get; set;}
    }

    public class Material {
        public int Id { get; set;}

        public Factory? Factory { get; set;}
    }

    public enum MaterialType {
        Untraceable,
        Batch,
        Serial
    }
}