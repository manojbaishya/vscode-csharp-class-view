using System;

namespace TestProject1
{
    public class TestProgram1Main {
        public static void Main(string[] args) {
            Console.WriteLine("Hello, TestProject1!");
        }
    }
}

namespace TestProject1.Models
{
    public class Employee {
        public int Id { get; set;}
        public string? Name { get; set;}
    }

    public class Account {
        public int Id { get; set;}

        public Employee? Employee { get; set;}
    }

    public enum AccountType {
        Checking,
        Savings
    }
}